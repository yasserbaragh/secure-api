const bcrypt = require('bcryptjs');
const db = require('./db');

db.exec(`DELETE FROM reviews; DELETE FROM order_items; DELETE FROM orders; DELETE FROM products; DELETE FROM users;
         DELETE FROM sqlite_sequence;`);

const hash = (p) => bcrypt.hashSync(p, 12);
const user = db.prepare('INSERT INTO users (name,email,password,role,phone,national_id) VALUES (?,?,?,?,?,?)');
user.run('Admin SouqDZ', 'admin@souqdz.dz', hash('Admin#Souq2024'), 'admin', '0550000001', '109880100012345678');
user.run('Amine B.',     'amine@example.dz', hash('Amine#2024'),    'customer', '0661111111', '199201160045671234');
user.run('Lina K.',      'lina@example.dz',  hash('Lina#2024'),     'customer', '0772222222', '199505120098765432');

const product = db.prepare('INSERT INTO products (name,description,price,stock) VALUES (?,?,?,?)');
product.run('Smartphone X12', '6.5" screen, 128 GB', 45000, 20);
product.run('Casque Bluetooth', 'Autonomie 30 h', 6500, 50);
product.run('Clavier mecanique', 'Switch rouge, AZERTY', 9800, 15);
product.run('Chargeur 65W', 'USB-C', 3200, 100);
product.run('Webcam HD', '1080p', 5400, 30);

const order = db.prepare('INSERT INTO orders (user_id,total,status,address) VALUES (?,?,?,?)');
order.run(2, 45000, 'delivered', '5 Rue Larbi Ben Mhidi, Blida');
order.run(3, 9700,  'pending',   '12 Rue Didouche Mourad, Alger');
order.run(3, 6500,  'shipped',   '12 Rue Didouche Mourad, Alger');

const review = db.prepare('INSERT INTO reviews (product_id,user_id,comment) VALUES (?,?,?)');
review.run(1, 2, 'Tres bon telephone, livraison rapide.');
review.run(2, 3, 'Son correct pour le prix.');
console.log('Database seeded.');
