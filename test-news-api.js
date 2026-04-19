const { pool } = require('./config/database');
const News = require('./models/News');

async function testNewsAPI() {
  try {
    console.log('🔍 Testing database connection...');
    const connectionTest = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', connectionTest.rows[0].now);

    console.log('\n🔍 Testing news table...');
    const tableTest = await pool.query('SELECT COUNT(*) FROM news');
    console.log('✅ News table exists, rows:', tableTest.rows[0].count);

    console.log('\n🔍 Testing News.findAll()...');
    const news = await News.findAll();
    console.log('✅ News.findAll() result:', news.length, 'articles');
    
    if (news.length > 0) {
      console.log('📄 First article:', {
        id: news[0].id,
        title: news[0].title,
        author: news[0].author,
        publication_date: news[0].publication_date
      });
    } else {
      console.log('📄 No articles found in database');
    }

    console.log('\n🔍 Creating a test news article...');
    const testArticle = {
      title: 'Test News Article',
      slug: 'test-news-article',
      excerpt: 'This is a test excerpt',
      content: 'This is test content for the news article.',
      author: 'Test Author',
      publication_date: '2024-01-15',
      image_url: 'https://example.com/test.jpg',
      category: 'News'
    };

    const created = await News.create(testArticle);
    console.log('✅ Test article created:', {
      id: created.id,
      title: created.title,
      slug: created.slug
    });

    console.log('\n🔍 Testing News.findAll() again...');
    const updatedNews = await News.findAll();
    console.log('✅ Total articles now:', updatedNews.length);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    console.log('\n🔚 Database connection closed');
  }
}

testNewsAPI();
