const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:Silke:@localhost:5432/imageboard");

exports.getImages = () => {
    return db.query("SELECT *, (SELECT id FROM images ORDER BY id ASC LIMIT 1) AS lastId FROM images ORDER BY id DESC LIMIT 12;");
};


exports.uploadImage = (url, username, title, description) => {
    return db.query (
        "INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4) RETURNING *;"
        , [url, username, title, description]
    );
};

exports.getImageById = (id) => {
    return db.query(
        "SELECT * FROM images WHERE id = $1;", [id]
    );
};

exports.getCommentByImageId = (id) => {
    return db.query(
        "SELECT * FROM comments WHERE imageId = $1;", [id]
    );
};

exports.insertComment = (username, comment, imageId) => {
    return db.query (
        "INSERT INTO comments (username, comment, imageId) VALUES ($1, $2, $3) RETURNING *;",
        [username, comment, imageId]
    );
};

exports.getMoreImages = lastId => db.query(
    "SELECT * FROM images WHERE id < $1 ORDER BY id DESC LIMIT 12;", [lastId]
);