const mongoose = require('mongoose');
async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/bomapro');
    const db = mongoose.connection;
    const collections = await db.db.listCollections().toArray();
    
    console.log('\n? Connected to bomapro database\n');
    console.log('Collections and document counts:\n');
    
    for (const coll of collections) {
      const count = await db.db.collection(coll.name).countDocuments();
      console.log(\?? \: \ documents\);
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}
checkData();
