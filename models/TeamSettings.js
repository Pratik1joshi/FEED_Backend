const { pool } = require('../config/database');

const OPTION_TYPES = ['role', 'department'];

const DEFAULT_OPTIONS = {
  role: [
    'Chairman & Principal Researcher',
    'Chief Technical Officer',
    'Research Director',
    'GIS & Remote Sensing Specialist',
  ],
  department: ['Leadership', 'Engineering', 'Research', 'Technology', 'Operations'],
};

const normalizeLabel = (value = '') => `${value}`.trim().replace(/\s+/g, ' ');

const createSlug = (value = '') =>
  normalizeLabel(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toSortOrder = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseBoolean = (value, fallback = true) => {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true;
    }

    if (value.toLowerCase() === 'false') {
      return false;
    }
  }

  return Boolean(value);
};

class TeamSettings {
  static validateType(optionType) {
    if (!OPTION_TYPES.includes(optionType)) {
      throw new Error('Invalid option type. Must be either "role" or "department".');
    }
  }

  static async ensureTableExists() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_member_options (
        id SERIAL PRIMARY KEY,
        option_type VARCHAR(20) NOT NULL CHECK (option_type IN ('role', 'department')),
        label VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(option_type, slug)
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_team_member_options_type ON team_member_options(option_type);
      CREATE INDEX IF NOT EXISTS idx_team_member_options_active ON team_member_options(is_active);
      CREATE INDEX IF NOT EXISTS idx_team_member_options_sort_order ON team_member_options(sort_order);
    `);

    await this.seedFromTeamMembers();
    await this.seedDefaultsIfEmpty();
  }

  static async seedFromTeamMembers() {
    try {
      await pool.query(`
        INSERT INTO team_member_options (option_type, label, slug, sort_order, is_active)
        SELECT
          'role',
          source.label,
          TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(source.label, '[^a-z0-9]+', '-', 'g'))),
          0,
          true
        FROM (
          SELECT DISTINCT TRIM(position) AS label
          FROM team_members
          WHERE position IS NOT NULL AND TRIM(position) <> ''
        ) AS source
        WHERE TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(source.label, '[^a-z0-9]+', '-', 'g'))) <> ''
        ON CONFLICT (option_type, slug) DO NOTHING
      `);

      await pool.query(`
        INSERT INTO team_member_options (option_type, label, slug, sort_order, is_active)
        SELECT
          'department',
          source.label,
          TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(source.label, '[^a-z0-9]+', '-', 'g'))),
          0,
          true
        FROM (
          SELECT DISTINCT TRIM(department) AS label
          FROM team_members
          WHERE department IS NOT NULL AND TRIM(department) <> ''
        ) AS source
        WHERE TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(source.label, '[^a-z0-9]+', '-', 'g'))) <> ''
        ON CONFLICT (option_type, slug) DO NOTHING
      `);
    } catch (error) {
      // In early setup flows, team_members may not exist yet.
      if (error.code !== '42P01') {
        throw error;
      }
    }
  }

  static async seedDefaultsIfEmpty() {
    for (const optionType of OPTION_TYPES) {
      const countResult = await pool.query(
        'SELECT COUNT(*)::int AS count FROM team_member_options WHERE option_type = $1',
        [optionType]
      );

      if (countResult.rows[0].count > 0) {
        continue;
      }

      const defaults = DEFAULT_OPTIONS[optionType] || [];
      for (let index = 0; index < defaults.length; index += 1) {
        const label = normalizeLabel(defaults[index]);
        const slug = createSlug(label);

        await pool.query(
          `
            INSERT INTO team_member_options (option_type, label, slug, sort_order, is_active)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (option_type, slug) DO NOTHING
          `,
          [optionType, label, slug, index + 1, true]
        );
      }
    }
  }

  static async getOptionsByType(optionType, options = {}) {
    await this.ensureTableExists();
    this.validateType(optionType);

    const includeInactive = options.includeInactive === true;
    const result = await pool.query(
      `
        SELECT id, option_type, label, slug, sort_order, is_active, created_at, updated_at
        FROM team_member_options
        WHERE option_type = $1
          ${includeInactive ? '' : 'AND is_active = true'}
        ORDER BY sort_order ASC, label ASC
      `,
      [optionType]
    );

    return result.rows;
  }

  static async getGroupedOptions(options = {}) {
    const [roles, departments] = await Promise.all([
      this.getOptionsByType('role', options),
      this.getOptionsByType('department', options),
    ]);

    return {
      roles,
      departments,
    };
  }

  static async createOption(optionData = {}) {
    await this.ensureTableExists();

    const optionType = optionData.option_type || optionData.type;
    this.validateType(optionType);

    const label = normalizeLabel(optionData.label);
    if (!label) {
      throw new Error('Label is required.');
    }

    const slug = createSlug(label);
    if (!slug) {
      throw new Error('Invalid label.');
    }

    const sortOrder = toSortOrder(optionData.sort_order, 0);
    const isActive = parseBoolean(optionData.is_active, true);

    try {
      const result = await pool.query(
        `
          INSERT INTO team_member_options (option_type, label, slug, sort_order, is_active)
          VALUES ($1, $2, $3, $4, $5)
          
        `,
        [optionType, label, slug, sortOrder, isActive]
      );

      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error(`${optionType === 'role' ? 'Role' : 'Department'} already exists.`);
      }
      throw error;
    }
  }

  static async updateOption(id, optionData = {}) {
    await this.ensureTableExists();

    const optionId = Number.parseInt(id, 10);
    if (Number.isNaN(optionId)) {
      throw new Error('Invalid option id.');
    }

    const existingResult = await pool.query(
      'SELECT * FROM team_member_options WHERE id = $1 LIMIT 1',
      [optionId]
    );
    const existingOption = existingResult.rows[0];

    if (!existingOption) {
      return null;
    }

    if (optionData.option_type || optionData.type) {
      const incomingType = optionData.option_type || optionData.type;
      if (incomingType !== existingOption.option_type) {
        throw new Error('Changing option type is not allowed.');
      }
    }

    const hasLabelUpdate = optionData.label !== undefined;
    const label = hasLabelUpdate ? normalizeLabel(optionData.label) : existingOption.label;

    if (!label) {
      throw new Error('Label is required.');
    }

    const slug = hasLabelUpdate ? createSlug(label) : existingOption.slug;
    if (!slug) {
      throw new Error('Invalid label.');
    }

    const sortOrder =
      optionData.sort_order !== undefined
        ? toSortOrder(optionData.sort_order, existingOption.sort_order)
        : existingOption.sort_order;

    const isActive =
      optionData.is_active !== undefined
        ? parseBoolean(optionData.is_active, existingOption.is_active)
        : existingOption.is_active;

    const duplicateCheck = await pool.query(
      `
        SELECT id
        FROM team_member_options
        WHERE option_type = $1 AND slug = $2 AND id <> $3
        LIMIT 1
      `,
      [existingOption.option_type, slug, optionId]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new Error(
        `${existingOption.option_type === 'role' ? 'Role' : 'Department'} already exists.`
      );
    }

    const updateResult = await pool.query(
      `
        UPDATE team_member_options
        SET label = $1,
            slug = $2,
            sort_order = $3,
            is_active = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        
      `,
      [label, slug, sortOrder, isActive, optionId]
    );

    if (hasLabelUpdate && label !== existingOption.label) {
      const fieldName = existingOption.option_type === 'role' ? 'position' : 'department';
      await pool.query(
        `
          UPDATE team_members
          SET ${fieldName} = $1
          WHERE ${fieldName} = $2
        `,
        [label, existingOption.label]
      );
    }

    return updateResult.rows[0];
  }

  static async deleteOption(id) {
    await this.ensureTableExists();

    const optionId = Number.parseInt(id, 10);
    if (Number.isNaN(optionId)) {
      throw new Error('Invalid option id.');
    }

    const existingResult = await pool.query(
      'SELECT * FROM team_member_options WHERE id = $1 LIMIT 1',
      [optionId]
    );
    const existingOption = existingResult.rows[0];

    if (!existingOption) {
      return null;
    }

    const fieldName = existingOption.option_type === 'role' ? 'position' : 'department';
    const usageResult = await pool.query(
      `
        SELECT COUNT(*)::int AS count
        FROM team_members
        WHERE ${fieldName} = $1
      `,
      [existingOption.label]
    );

    if (usageResult.rows[0].count > 0) {
      throw new Error(
        `Cannot delete ${existingOption.option_type} "${existingOption.label}" because it is assigned to ${usageResult.rows[0].count} team member(s).`
      );
    }

    const deleteResult = await pool.query(
      'DELETE FROM team_member_options WHERE id = $1 ',
      [optionId]
    );

    return deleteResult.rows[0];
  }
}

module.exports = TeamSettings;