const cloudinary = require("cloudinary").v2;

export default function assetDestroyer(req, res) {
  const {
    query: { public_id },
    method,
  } = req;

  switch (method) {
    case "POST":
      // Get data from your database
      const deestroy = cloudinary.uploader.destroy(
        public_id,
        function (error, result) {
          //console.log(result, error);
          res.statusCode = 200;
          res.json(result);
        }
      );
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
