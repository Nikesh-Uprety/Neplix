import pg from "pg";

const { Pool } = pg;

const NEON_URL = "postgresql://neondb_owner:npg_UNZMsT1QE7KY@ep-floral-sea-a1yth453-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const RAILWAY_URL = "postgresql://postgres:lqdTdXjuoqjuxIQlzmXOVOtzBbVCWKQU@nozomi.proxy.rlwy.net:21406/railway";

async function runTest(name, url) {
  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  const results = {};

  try {
    // Test 1: Connection time
    const connStart = Date.now();
    const conn = await pool.connect();
    results.connectionTime = Date.now() - connStart;
    conn.release();

    // Test 2: Simple query
    const queryStart = Date.now();
    await pool.query("SELECT 1");
    results.simpleQueryTime = Date.now() - queryStart;

    // Test 3: Create table
    await pool.query(`CREATE TABLE IF NOT EXISTS speed_test_${name} (id SERIAL, data TEXT, created_at TIMESTAMP DEFAULT NOW())`);

    // Test 4: Insert 100 rows
    const insertStart = Date.now();
    for (let i = 0; i < 100; i++) {
      await pool.query(`INSERT INTO speed_test_${name} (data) VALUES ($1)`, [`test_data_${i}`]);
    }
    results.insert100Rows = Date.now() - insertStart;

    // Test 5: Select all
    const selectStart = Date.now();
    const res = await pool.query(`SELECT * FROM speed_test_${name}`);
    results.select100Rows = Date.now() - selectStart;
    results.rowCount = res.rows.length;

    // Test 6: Update rows
    const updateStart = Date.now();
    await pool.query(`UPDATE speed_test_${name} SET data = 'updated' WHERE id > 50`);
    results.update50Rows = Date.now() - updateStart;

    // Test 7: Delete
    const deleteStart = Date.now();
    await pool.query(`DELETE FROM speed_test_${name} WHERE id > 90`);
    results.delete10Rows = Date.now() - deleteStart;

    // Cleanup
    await pool.query(`DROP TABLE speed_test_${name}`);

    results.status = "✅ SUCCESS";
  } catch (error) {
    results.status = "❌ FAILED";
    results.error = error.message;
  } finally {
    await pool.end();
  }

  return { name, results };
}

async function main() {
  console.log("🚀 Database Comparison Test\n");
  console.log("=".repeat(50));

  console.log("\n📊 Testing Neon Tech PostgreSQL...");
  const neonResults = await runTest("neon", NEON_URL);
  console.log("Neon:", JSON.stringify(neonResults.results, null, 2));

  console.log("\n📊 Testing Railway PostgreSQL...");
  const railwayResults = await runTest("railway", RAILWAY_URL);
  console.log("Railway:", JSON.stringify(railwayResults.results, null, 2));

  console.log("\n" + "=".repeat(50));
  console.log("\n📈 RESULTS COMPARISON\n");

  const metrics = ["connectionTime", "simpleQueryTime", "insert100Rows", "select100Rows", "update50Rows", "delete10Rows"];

  console.log("| Metric          | Neon  | Railway | Winner |");
  console.log("|-----------------|-------|---------|--------|");

  for (const metric of metrics) {
    const neonTime = neonResults.results[metric] ?? "N/A";
    const railwayTime = railwayResults.results[metric] ?? "N/A";
    let winner = "-";
    
    if (typeof neonTime === "number" && typeof railwayTime === "number") {
      winner = neonTime < railwayTime ? "🟢 Neon" : "🔵 Railway";
    }
    
    console.log(`| ${metric.padEnd(15)} | ${String(neonTime).padStart(5)}ms | ${String(railwayTime).padStart(7)}ms | ${winner} |`);
  }

  console.log(`\n| Status | ${neonResults.results.status} | ${railwayResults.results.status} |`);

  console.log("\n" + "=".repeat(50));
}

main().catch(console.error);
