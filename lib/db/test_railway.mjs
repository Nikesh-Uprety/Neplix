import pg from "pg";

const { Pool } = pg;

const RAILWAY_URL = "postgresql://postgres:lqdTdXjuoqjuxIQlzmXOVOtzBbVCWKQU@nozomi.proxy.rlwy.net:21406/railway";

async function runRailwayTest() {
  const pool = new Pool({ connectionString: RAILWAY_URL, ssl: { rejectUnauthorized: false } });
  const results = {};

  try {
    console.log("🔗 Testing Railway PostgreSQL connection...");
    const connStart = Date.now();
    const conn = await pool.connect();
    results.connectionTime = Date.now() - connStart;
    console.log(`✅ Connection time: ${results.connectionTime}ms`);
    conn.release();

    console.log("\n📝 Running queries...");
    const queryStart = Date.now();
    await pool.query("SELECT 1");
    results.simpleQueryTime = Date.now() - queryStart;
    console.log(`✅ Simple query: ${results.simpleQueryTime}ms`);

    console.log("\n🗃️ Creating test table...");
    await pool.query(`CREATE TABLE IF NOT EXISTS speed_test_railway (id SERIAL, data TEXT, created_at TIMESTAMP DEFAULT NOW())`);
    console.log("✅ Table created");

    console.log("\n➕ Inserting 100 rows...");
    const insertStart = Date.now();
    for (let i = 0; i < 100; i++) {
      await pool.query(`INSERT INTO speed_test_railway (data) VALUES ($1)`, [`test_data_${i}`]);
    }
    results.insert100Rows = Date.now() - insertStart;
    console.log(`✅ Insert 100 rows: ${results.insert100Rows}ms`);

    console.log("\n🔍 Selecting 100 rows...");
    const selectStart = Date.now();
    const res = await pool.query(`SELECT * FROM speed_test_railway`);
    results.select100Rows = Date.now() - selectStart;
    results.rowCount = res.rows.length;
    console.log(`✅ Select 100 rows: ${results.select100Rows}ms`);

    console.log("\n✏️ Updating 50 rows...");
    const updateStart = Date.now();
    await pool.query(`UPDATE speed_test_railway SET data = 'updated' WHERE id > 50`);
    results.update50Rows = Date.now() - updateStart;
    console.log(`✅ Update 50 rows: ${results.update50Rows}ms`);

    console.log("\n🗑️ Deleting 10 rows...");
    const deleteStart = Date.now();
    await pool.query(`DELETE FROM speed_test_railway WHERE id > 90`);
    results.delete10Rows = Date.now() - deleteStart;
    console.log(`✅ Delete 10 rows: ${results.delete10Rows}ms`);

    console.log("\n🧹 Cleaning up...");
    await pool.query(`DROP TABLE speed_test_railway`);
    console.log("✅ Table dropped");

    results.status = "✅ SUCCESS";
  } catch (error) {
    results.status = "❌ FAILED";
    results.error = error.message;
    console.log(`❌ Error: ${error.message}`);
  } finally {
    await pool.end();
  }

  return results;
}

runRailwayTest().then(results => {
  console.log("\n" + "=".repeat(50));
  console.log("📊 RAILWAY RESULTS:");
  console.log(JSON.stringify(results, null, 2));
});
