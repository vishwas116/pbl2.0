CREATE TABLE buyer (
  bid SERIAL PRIMARY KEY,
  bname VARCHAR(100) NOT NULL,
  busername VARCHAR(100) NOT NULL,
  bpassword VARCHAR(100) NOT NULL,
  bhash VARCHAR(100) NOT NULL,
  bemail VARCHAR(100) NOT NULL,
  bmobile VARCHAR(100) NOT NULL,
  baddress TEXT NOT NULL,
  bactive INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE farmer (
  fid SERIAL PRIMARY KEY,
  fname VARCHAR(255) NOT NULL,
  fusername VARCHAR(255) NOT NULL,
  fpassword VARCHAR(255) NOT NULL,
  fhash VARCHAR(255) NOT NULL,
  femail VARCHAR(255) NOT NULL,
  fmobile VARCHAR(255) NOT NULL,
  faddress TEXT NOT NULL,
  factive INTEGER NOT NULL DEFAULT 0,
  frating INTEGER NOT NULL DEFAULT 0,
  picExt VARCHAR(255) NOT NULL DEFAULT 'png',
  picStatus INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE fproduct (
  fid INTEGER NOT NULL,
  pid SERIAL PRIMARY KEY,
  product VARCHAR(255) NOT NULL,
  pcat VARCHAR(255) NOT NULL,
  pinfo VARCHAR(255) NOT NULL,
  price FLOAT NOT NULL,
  pimage VARCHAR(255) NOT NULL DEFAULT 'blank.png',
  picStatus INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE mycart (
  bid INTEGER NOT NULL,
  pid INTEGER NOT NULL
);

CREATE TABLE review (
  pid INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL
);

CREATE TABLE transaction (
  tid SERIAL PRIMARY KEY,
  bid INTEGER NOT NULL,
  pid INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  mobile VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  pincode VARCHAR(255) NOT NULL,
  addr VARCHAR(255) NOT NULL
);

-- Insert sample data
INSERT INTO farmer (fid, fname, fusername, fpassword, fhash, femail, fmobile, faddress, factive, frating, picExt, picStatus) 
VALUES
(3, 'Kaivalya Hemant Mendki', 'ThePhenom', '$2y$10$22ezmzHRa9c5ycHmVm5RpOnlT4LwFaDZar1XhmLRJQKGrcVRhPgti', '61b4a64be663682e8cb037d9719ad8cd', 'kmendki98@gmail.com', '8600611198', 'abcde', 0, 0, 'png', 0);

INSERT INTO fproduct (fid, pid, product, pcat, pinfo, price, pimage, picStatus) 
VALUES
(3, 27, 'Mango', 'Fruit', '<p>Mango raseela</p>\r\n', 500, 'Mango3.jpeg', 1),
(3, 28, 'Ladyfinger', 'Vegetable', '<p>Its veggie</p>\r\n', 1000, 'Ladyfinger3.jpg', 1),
(3, 29, 'Bajra', 'Grains', '<p>bajre di rti</p>\r\n', 400, 'Bajra3.jpg', 1),
(3, 30, 'Banana', 'Fruit', '<p>Jalgaon banana</p>\r\n', 400, 'Banana3.jpg', 1);

INSERT INTO mycart (bid, pid) 
VALUES
(3, 27),
(3, 30);

INSERT INTO transaction (tid, bid, pid, name, city, mobile, email, pincode, addr) 
VALUES
(1, 3, 28, 'sa,j,cns', 'sajc', 'sajch', 'kmendki98@gmail.com', 'sacu', 'ckaskjc');

-- Set foreign key constraint
ALTER TABLE buyer
  ADD CONSTRAINT buyer_ibfk_1 FOREIGN KEY (bid) REFERENCES farmer (fid);
