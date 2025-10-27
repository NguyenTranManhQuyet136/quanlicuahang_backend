const express = require("express");
const app = express();
const db = require("./db");
const cors = require("cors");
const bodyParser = require("body-parser");
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

app.get("/test", async (req, res) => {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
});

app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const rows = await db.query(
            "SELECT * FROM users WHERE username = ? AND password = ?",
            [username, password],
        );


        const row = rows[0];
        if (row.length == 1) {
            let passStar = ''
            for (let i = 0; i < row[0].password.length; i++) {
                passStar += "*"
            } 
            res.json({ statusCheck: true, username: row[0].username, password: passStar , role: row[0].role });
        } else {
            res.json({ statusCheck: false });
        }
    } catch {
        res.status(500)
    }
});

app.get("/api/product", async (req, res) => {
    const [dataProduct] = await db.query(
        "SELECT * FROM quanlicuahang.products",
    );
    res.json(dataProduct);
});

app.post("/api/product/remove", async (req, res) => {
    const { id } = req.body;
    await db.query("DELETE FROM quanlicuahang.products WHERE id = ?", [id]);
    res.sendStatus(200);
});

app.post("/api/product/add", async (req, res) => {
    const { id, name, price, quantity, status } = req.body;
    await db.query(
        `INSERT INTO quanlicuahang.products (id, name, price, quantity, status) VALUES (?,?,?,?,?)`,
        [id, name, price, quantity, status],
    );
    res.sendStatus(200);
});

app.post("/api/product/fix", async (req, res) => {
    const { id, name, price, quantity, status, idOld } = req.body;
    await db.query(
        ` UPDATE quanlicuahang.products SET id = ?, name = ?, price = ?, quantity = ?, status = ? WHERE id = ?`,
        [id, name, price, quantity, status, idOld],
    );
    res.sendStatus(200);
});

app.post("/api/product/search", async (req, res) => {
    const { id, name } = req.body;
    const [dataProduct] = await db.query(
        `SELECT * FROM quanlicuahang.products WHERE id = ?  OR name LIKE ? `,
        [id, `%${name}%`],
    );
    res.json(dataProduct);
    res.sendStatus(200);
});

// -----------------------------------------------------------------------------------------------------------------------------

app.get("/api/customer", async (req, res) => {
    const [dataCustomer] = await db.query(
        "SELECT * FROM quanlicuahang.customers",
    );
    res.json(dataCustomer);
});

app.post("/api/customer/remove", async (req, res) => {
    const { id } = req.body;
    await db.query("DELETE FROM quanlicuahang.customers WHERE id = ?", [id]);
    res.sendStatus(200);
});

app.post("/api/customer/add", async (req, res) => {
    const { id, fullname, birthyear, address, status } = req.body;
    await db.query(
        `INSERT INTO quanlicuahang.customers (id,fullname,birthyear,address,status) VALUES (?,?,?,?,?)`,
        [id, fullname, birthyear, address, status],
    );
    res.sendStatus(200);
});

app.post("/api/customer/fix", async (req, res) => {
    const { id, fullname, birthyear, address, status, idOld } = req.body;
    await db.query(
        ` UPDATE quanlicuahang.customers SET id = ?, fullname = ?, birthyear = ?, address = ?, status = ? WHERE id = ?`,
        [id, fullname, birthyear, address, status, idOld],
    );
    res.sendStatus(200);
});

app.post("/api/customer/search", async (req, res) => {
    const { id, fullname } = req.body;
    const [dataCustomer] = await db.query(
        `SELECT * FROM quanlicuahang.customers WHERE id = ?  OR fullname LIKE ? `,
        [id, `%${fullname}%`],
    );
    res.json(dataCustomer);
    res.sendStatus(200);
});

//-----------------------------------------------------------------------------------------------------------------------------------
app.get("/api/order", async (req, res) => {
    const [dataOrder] = await db.query("SELECT * FROM quanlicuahang.orders");
    res.json(dataOrder);
});

app.post("/api/order/remove", async (req, res) => {
    const { id } = req.body;
    await db.query("DELETE FROM quanlicuahang.orders WHERE id = ?", [id]);
    res.sendStatus(200);
});

app.post("/api/order/add", async (req, res) => {
    const { id, customer_id, order_date, total_price, status } = req.body;
    await db.query(
        "INSERT INTO quanlicuahang.orders (id, customer_id, order_date, total_price, status) VALUES (?, ?, ?, ?, ?)",
        [id, customer_id, order_date, total_price, status],
    );
    res.sendStatus(200);
});

app.post("/api/order/fix", async (req, res) => {
    const { id, customer_id, order_date, total_price, status, idOld } =
        req.body;
    await db.query(
        "UPDATE quanlicuahang.orders SET id = ?, customer_id = ?, order_date = ?, total_price = ?, status = ? WHERE id = ?",
        [id, customer_id, order_date, total_price, status, idOld],
    );
    res.sendStatus(200);
});

app.post("/api/order/search", async (req, res) => {
    const { id, customer_id } = req.body;
    const [dataOrder] = await db.query(
        "SELECT * FROM quanlicuahang.orders WHERE id = ? OR customer_id = ?",
        [id, customer_id],
    );
    res.json(dataOrder);
});

// ============================================================

app.get("/api/warehouse", async (req, res) => {
    const [dataWarehouse] = await db.query(
        "SELECT * FROM quanlicuahang.warehouses",
    );
    res.json(dataWarehouse);
});

app.post("/api/warehouse/remove", async (req, res) => {
    const { id } = req.body;
    await db.query("DELETE FROM quanlicuahang.warehouses WHERE id = ?", [id]);
    res.sendStatus(200);
});

app.post("/api/warehouse/add", async (req, res) => {
    const { id, supplier_name, import_date, total_value, status } = req.body;
    await db.query(
        `INSERT INTO quanlicuahang.warehouses (id, supplier_name, import_date, total_value, status) 
     VALUES (?, ?, ?, ?, ?)`,
        [id, supplier_name, import_date, total_value, status],
    );
    res.sendStatus(200);
});

app.post("/api/warehouse/fix", async (req, res) => {
    const { id, supplier_name, import_date, total_value, status, idOld } =
        req.body;
    await db.query(
        `UPDATE quanlicuahang.warehouses 
     SET id = ?, supplier_name = ?, import_date = ?, total_value = ?, status = ? 
     WHERE id = ?`,
        [id, supplier_name, import_date, total_value, status, idOld],
    );
    res.sendStatus(200);
});

app.post("/api/warehouse/search", async (req, res) => {
    const { id, supplier_name } = req.body;
    const [dataWarehouse] = await db.query(
        `SELECT * FROM quanlicuahang.warehouses 
     WHERE id = ? OR supplier_name LIKE ?`,
        [id, `%${supplier_name}%`],
    );
    res.json(dataWarehouse);
});


//-----------------------------------------------------------------------------
app.post("/api/user/fix", async (req,res) => {
    const {username,fullname,gender,birthday,position,phoneNumber,email} = req.body
    await db.query (
         `
      UPDATE users_detail
      SET 
        fullname = ?, 
        gender = ?, 
        birthday = ?, 
        position = ?, 
        phone_number = ?, 
        email = ?
      WHERE username = ?
      `,
      [fullname, gender, birthday, position, phoneNumber, email, username]
    )
    res.sendStatus(200)
})

app.post("/api/users_detail", async (req,res) => {
    const {username} = req.body
    console.log(username)
    try{
        const [row] = await db.query(
            `select * from quanlicuahang.users_detail where username = ?`, [username]
        )

        res.json(row)
        res.sendStatus(200)

    } catch {
        res.json("ko tim thay username")
    }

})

app.post("/api/findUser", async (req,res) => {
    const {username, password} = req.body
    const [row] = await db.query(
        `select * from quanlicuahang.users where username = ? and password = ?`, [username, password]
    )

    if (row.length == 1) {
        res.json({status: true})
    } else {
        res.json({status: false})
    }

})

app.post("/api/user/change_password", async (req,res) => {
    const {passwordChange, username} = req.body
    try {
        await db.query("update quanlicuahang.users set password = ? where username = ?", [passwordChange, username])
        res.json({status: true})
        res.sendStatus(200)
    } catch {
        res.json({status: false})
        res.send("loi~")
    }
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
