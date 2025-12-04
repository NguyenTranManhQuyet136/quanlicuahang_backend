const express = require("express");
const app = express();
const db = require("./db");
const cors = require("cors");
const bodyParser = require("body-parser");
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
        const rows = await db.query(query);

        const row = rows[0];
        if (row.length == 1) {
            let passStar = ''
            for (let i = 0; i < row[0].password.length; i++) {
                passStar += "*"
            }
            res.json({ statusCheck: true, username: row[0].username, role: row[0].role, password: passStar });
        } else {
            res.json({ statusCheck: false });
        }
    } catch {
        res.status(500)
    }
});

app.post("/api/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        const [existingUser] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        if (existingUser.length > 0) {
            return res.json({ status: false, message: "Tên tài khoản đã tồn tại" });
        }

        await db.query(
            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
            [username, password, 'user']
        );

        await db.query(
            "INSERT INTO customers (customer_id) VALUES (?)",
            [username]
        );


        res.json({ status: true, message: "Đăng ký thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Lỗi server" });
    }
});

app.get("/api/product", async (req, res) => {
    const [dataProduct] = await db.query(
        "SELECT * FROM quanlicuahang.products",
    );
    res.json(dataProduct);
});

app.post("/api/product/remove", async (req, res) => {
    const { product_id } = req.body;
    await db.query("DELETE FROM quanlicuahang.products WHERE product_id = ?", [product_id]);
    res.sendStatus(200);
});

app.post("/api/product/add", async (req, res) => {
    const { product_id, name, price, price_sell, description, type, image, quantity, warehouse_id, status } = req.body;
    await db.query(
        `INSERT INTO quanlicuahang.products (product_id, name, price, price_sell, description, type, image, quantity, warehouse_id, status) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [product_id, name, price, price_sell, description, type, image, quantity, warehouse_id, status],
    );
    res.sendStatus(200);
});

app.post("/api/product/fix", async (req, res) => {
    const { product_id, name, price, price_sell, description, type, image, quantity, warehouse_id, status, idOld } = req.body;
    await db.query(
        ` UPDATE quanlicuahang.products SET product_id = ?, name = ?, price = ?, price_sell = ?, description = ?, type = ?, image = ?, quantity = ?, warehouse_id = ?, status = ? WHERE product_id = ?`,
        [product_id, name, price, price_sell, description, type, image, quantity, warehouse_id, status, idOld],
    );
    res.sendStatus(200);
});

app.post("/api/product/search", async (req, res) => {
    const { product_id, name } = req.body;
    console.log(product_id, name);
    const [dataProduct] = await db.query(
        `SELECT * FROM quanlicuahang.products WHERE product_id LIKE ?  OR name LIKE ? `,
        [`%${product_id}%`, `%${name}%`],
    );
    res.json(dataProduct);
    res.sendStatus(200);
});

app.get("/api/product/generate-id", async (req, res) => {
    let id;
    let isUnique = false;
    while (!isUnique) {
        const randomNum = Math.floor(Math.random() * 10000);
        id = `SP${randomNum}`;
        const [rows] = await db.query("SELECT product_id FROM quanlicuahang.products WHERE product_id = ?", [id]);
        if (rows.length === 0) {
            isUnique = true;
        }
    }
    res.json({ id });
});

// -----------------------------------------------------------------------------------------------------------------------------

app.get("/api/customer", async (req, res) => {
    const [dataCustomer] = await db.query(
        "SELECT * FROM quanlicuahang.customers",
    );
    res.json(dataCustomer);
});

app.post("/api/customer/remove", async (req, res) => {
    const { customer_id } = req.body;
    const [orders] = await db.query("SELECT order_id FROM quanlicuahang.orders WHERE customer_id = ?", [customer_id]);

    if (orders.length > 0) {
        const orderIds = orders.map(order => order.order_id);
        await db.query("DELETE FROM quanlicuahang.order_detail WHERE order_id IN (?)", [orderIds]);
        await db.query("DELETE FROM quanlicuahang.orders WHERE customer_id = ?", [customer_id]);
    }

    await db.query("DELETE FROM quanlicuahang.customers WHERE customer_id = ?", [customer_id]);
    res.sendStatus(200);
});

app.post("/api/customer/add", async (req, res) => {
    const { customer_id, fullname, birthday, gender, address, phone_number, email } = req.body;
    await db.query(
        `INSERT INTO quanlicuahang.customers (customer_id, fullname, birthday, gender, address, phone_number, email) VALUES (?,?,?,?,?,?,?)`,
        [customer_id, fullname, birthday, gender, address, phone_number, email],
    );
    res.sendStatus(200);
});

app.post("/api/customer/fix", async (req, res) => {
    const { customer_id, fullname, birthday, gender, address, phone_number, email, idOld } = req.body;
    await db.query(
        ` UPDATE quanlicuahang.customers SET customer_id = ?, fullname = ?, birthday = ?, gender = ?, address = ?, phone_number = ?, email = ? WHERE customer_id = ?`,
        [customer_id, fullname, birthday, gender, address, phone_number, email, idOld],
    );
    res.sendStatus(200);
});

app.post("/api/customer/search", async (req, res) => {
    const { customer_id, fullname } = req.body;
    const [dataCustomer] = await db.query(
        `SELECT * FROM quanlicuahang.customers WHERE customer_id = ?  OR fullname LIKE ? `,
        [customer_id, `%${fullname}%`],
    );
    res.json(dataCustomer);
    res.sendStatus(200);
});

app.post("/api/customer/get", async (req, res) => {
    const { customer_id } = req.body;
    try {
        const [rows] = await db.query(
            "SELECT * FROM quanlicuahang.customers WHERE customer_id = ?",
            [customer_id]
        );
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: "Customer not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

//-----------------------------------------------------------------------------------------------------------------------------------
app.get("/api/order", async (req, res) => {
    const [dataOrder] = await db.query("SELECT * FROM quanlicuahang.orders");
    res.json(dataOrder);
});

app.post("/api/order/remove", async (req, res) => {
    const { order_id } = req.body;
    await db.query("DELETE FROM quanlicuahang.orders WHERE order_id = ?", [order_id]);
    res.sendStatus(200);
});

app.post("/api/order/add", async (req, res) => {
    const { order_id, customer_id, order_date, total_price, created_by, status } = req.body;
    await db.query(
        "INSERT INTO quanlicuahang.orders (order_id, customer_id, order_date, total_price, created_by, status) VALUES (?, ?, ?, ?, ?, ?)",
        [order_id, customer_id, order_date, total_price, created_by, status || 'Đang chờ xác nhận'],
    );
    res.sendStatus(200);
});

app.post("/api/order/fix", async (req, res) => {
    const { order_id, customer_id, order_date, total_price, status, idOld } =
        req.body;
    await db.query(
        "UPDATE quanlicuahang.orders SET order_id = ?, customer_id = ?, order_date = ?, total_price = ?, status = ? WHERE order_id = ?",
        [order_id, customer_id, order_date, total_price, status, idOld],
    );
    res.sendStatus(200);
});

app.post("/api/order/update_status", async (req, res) => {
    const { order_id, status } = req.body;
    try {
        await db.query(
            "UPDATE quanlicuahang.orders SET status = ? WHERE order_id = ?",
            [status, order_id]
        );
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.post("/api/order/search", async (req, res) => {
    const { order_id, customer_id } = req.body;
    const [dataOrder] = await db.query(
        "SELECT * FROM quanlicuahang.orders WHERE order_id LIKE ? OR customer_id LIKE ?",
        [`%${order_id}%`, `%${customer_id}%`],
    );
    res.json(dataOrder.reverse());
    res.sendStatus(200)
});

app.get("/api/profit", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                SUM((od.unit_price - p.price) * od.unit_quantity) as total_profit
            FROM
                quanlicuahang.order_detail od
            JOIN
                quanlicuahang.products p ON od.product_id = p.product_id
            JOIN
                quanlicuahang.orders o ON od.order_id = o.order_id
            WHERE
                o.status != 'Đã hủy'
        `);
        res.json({ total_profit: rows[0].total_profit || 0 });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

app.get("/api/order/generate-id", async (req, res) => {
    let id;
    let isUnique = false;
    while (!isUnique) {
        const randomNum = Math.floor(Math.random() * 10000);
        id = `ORD${randomNum}`;
        const [rows] = await db.query("SELECT order_id FROM quanlicuahang.orders WHERE order_id = ?", [id]);
        if (rows.length === 0) {
            isUnique = true;
        }
    }
    res.json({ id });
});

app.post("/api/order/detail", async (req, res) => {
    const { id } = req.body;
    const [data] = await db.query(
        `
        SELECT
            *,
            O.status AS order_status
        FROM
            quanlicuahang.orders AS O
        INNER JOIN
            quanlicuahang.customers AS C ON O.customer_id = C.customer_id
        INNER JOIN
            quanlicuahang.order_detail AS OD ON O.order_id = OD.order_id
        INNER JOIN
            quanlicuahang.products AS P ON OD.product_id = P.product_id
        WHERE
           O.order_id = ?;`,
        [id],
    );
    res.json(data);
    res.sendStatus(200)
});

app.post("/api/order_detail/add", async (req, res) => {
    const { order_id, product_id, unit_quantity, unit_price } = req.body;
    await db.query(
        "INSERT INTO quanlicuahang.order_detail (order_id, product_id, unit_quantity, unit_price) VALUES (?, ?, ?, ?)",
        [order_id, product_id, unit_quantity, unit_price],
    );
    res.sendStatus(200);
});

app.post("/api/checkout", async (req, res) => {
    const { customer_id, total_price, note, cart_items, order_id: providedOrderId } = req.body;
    const order_id = providedOrderId || `ORD-${Date.now()}`;
    const order_date = new Date().toISOString().split('T')[0];

    console.log(customer_id);

    try {
        await db.query(
            "INSERT INTO quanlicuahang.orders (order_id, customer_id, order_date, total_price, created_by, note, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [order_id, customer_id, order_date, total_price, customer_id, note || '', 'Đang chờ xác nhận']
        );


        for (const item of cart_items) {
            await db.query(
                "INSERT INTO quanlicuahang.order_detail (order_id, product_id, unit_quantity, unit_price) VALUES (?, ?, ?, ?)",
                [order_id, item.product_id, item.quantity, item.price]
            );
            await db.query(
                "UPDATE quanlicuahang.products SET quantity = quantity - ? WHERE product_id = ?",
                [item.quantity, item.product_id]
            );
        }

        res.json({ status: true, message: "Đặt hàng thành công", order_id });
    } catch (error) {
        console.error("Checkout error:", error);
        res.status(500).json({ status: false, message: "Lỗi khi đặt hàng" });
    }
});

// ============================================================

app.get("/api/warehouse", async (req, res) => {
    const [dataWarehouse] = await db.query(
        "SELECT * FROM quanlicuahang.warehouses",
    );
    res.json(dataWarehouse);
});

app.post("/api/warehouse/remove", async (req, res) => {
    const { warehouse_id } = req.body;
    await db.query("DELETE FROM quanlicuahang.products WHERE warehouse_id = ?", [warehouse_id]);
    await db.query("DELETE FROM quanlicuahang.warehouses WHERE warehouse_id = ?", [warehouse_id]);
    res.sendStatus(200);
});

app.post("/api/warehouse/add", async (req, res) => {
    const { warehouse_id, supplier_name, import_date, status } = req.body;
    await db.query(
        `INSERT INTO quanlicuahang.warehouses (warehouse_id, supplier_name, import_date, status) 
     VALUES (?, ?, ?, ?)`,
        [warehouse_id, supplier_name, import_date, status],
    );
    res.sendStatus(200);
});

app.post("/api/warehouse/fix", async (req, res) => {
    const { warehouse_id, supplier_name, import_date, status, idOld } =
        req.body;
    await db.query(
        `UPDATE quanlicuahang.warehouses 
     SET warehouse_id = ?, supplier_name = ?, import_date = ?, status = ? 
     WHERE warehouse_id = ?`,
        [warehouse_id, supplier_name, import_date, status, idOld],
    );
    res.sendStatus(200);
});

app.post("/api/warehouse/search", async (req, res) => {
    const { warehouse_id, supplier_name } = req.body;
    const [dataWarehouse] = await db.query(
        `SELECT * FROM quanlicuahang.warehouses 
     WHERE warehouse_id LIKE ? OR supplier_name LIKE ?`,
        [`%${warehouse_id}%`, `%${supplier_name}%`],
    );
    res.json(dataWarehouse);
    res.sendStatus(200)
});

app.post("/api/warehouse/detail", async (req, res) => {
    const { id } = req.body;
    const [dataProduct] = await db.query(
        `SELECT 
            P.*,
            W.supplier_name,
            W.import_date,
            W.status AS warehouse_status
         FROM quanlicuahang.products P
         JOIN quanlicuahang.warehouses W ON P.warehouse_id = W.warehouse_id
         WHERE P.warehouse_id = ?`,
        [id],
    )
    res.json(dataProduct)
    res.sendStatus(200)
})



app.get("/api/warehouse/generate-id", async (req, res) => {
    let id;
    let isUnique = false;
    while (!isUnique) {
        const randomNum = Math.floor(Math.random() * 10000);
        id = `WH${randomNum}`;
        const [rows] = await db.query("SELECT warehouse_id FROM quanlicuahang.warehouses WHERE warehouse_id = ?", [id]);
        if (rows.length === 0) {
            isUnique = true;
        }
    }
    res.json({ id });
});

//-----------------------------------------------------------------------------
app.post("/api/user/fix", async (req, res) => {
    const { username, fullname, gender, birthday, position, phone_number, email } = req.body
    await db.query(
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
        [fullname, gender, birthday, position, phone_number, email, username]
    )
    res.sendStatus(200)
})

app.post("/api/users_detail", async (req, res) => {
    const { username } = req.body
    try {
        const [row] = await db.query(
            `select * from quanlicuahang.users_detail where username = ?`, [username]
        )

        res.json(row)
        res.sendStatus(200)

    } catch {
        res.json("ko tim thay username")
    }

})



app.post("/api/findUser", async (req, res) => {
    const { username, password } = req.body
    const [row] = await db.query(
        `select * from quanlicuahang.users where username = ? and password = ?`, [username, password]
    )

    if (row.length == 1) {
        res.json({ status: true })
    } else {
        res.json({ status: false })
    }

})

app.post("/api/user/change_password", async (req, res) => {
    const { passwordChange, username } = req.body
    try {
        await db.query("update quanlicuahang.users set password = ? where username = ?", [passwordChange, username])
        res.json({ status: true })
        res.sendStatus(200)
    } catch {
        res.json({ status: false })
        res.send("loi~")
    }
})




app.post("/api/admin/history", async (req, res) => {
    const { content, created_by } = req.body;
    const time = new Date();
    try {
        await db.query(
            "INSERT INTO quanlicuahang.history_admin (content, time, created_by) VALUES (?, ?, ?)",
            [content, time, created_by]
        );
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/api/user/history", (req, res) => {
    const { content, created_by } = req.body;
    const time = new Date();
    const sql = "INSERT INTO history_user (content, time, created_by) VALUES (?, ?, ?)";
    db.query(sql, [content, time, created_by], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ message: "Lỗi", status: false });
        } else {
            res.json({ message: "Thêm thành công", status: true });
        }
    });
});

app.get("/api/admin/history", async (req, res) => {
    const { username } = req.query;
    try {
        const [rows] = await db.query("SELECT * FROM quanlicuahang.history_admin WHERE created_by = ? ORDER BY time DESC", [username]);
        res.json(rows);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/api/user/history", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM history_user ORDER BY time DESC");
        res.json(rows);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/api/categories", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM categories");
        res.json(rows);
    } catch (error) {
        res.json([]);
    }
});

app.post("/api/categories/add", async (req, res) => {
    const { name } = req.body;
    try {
        await db.query("INSERT INTO categories (name) VALUES (?)", [name]);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post("/api/categories/remove", async (req, res) => {
    const { id } = req.body;
    try {
        await db.query("DELETE FROM categories WHERE id = ?", [id]);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get("/api/accounts", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM users");
        res.json(rows);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post("/api/accounts/add", async (req, res) => {
    const { username, password, role } = req.body;
    try {
        await db.query("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, password, role]);
        if (role === 'user') {
            await db.query("INSERT INTO customers (customer_id) VALUES (?)", [username]);
        }
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post("/api/accounts/remove", async (req, res) => {
    const { username } = req.body;
    try {
        await db.query("DELETE FROM users WHERE username = ?", [username]);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post("/api/accounts/search", async (req, res) => {
    const { username } = req.body;
    try {
        const [rows] = await db.query("SELECT * FROM users WHERE username LIKE ?", [`%${username}%`]);
        res.json(rows);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/api/superadmin/history/all", async (req, res) => {
    try {
        const [adminRows] = await db.query("SELECT * FROM quanlicuahang.history_admin ORDER BY time DESC");
        const [userRows] = await db.query("SELECT * FROM history_user ORDER BY time DESC");
        res.json({ admin: adminRows, user: userRows });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
