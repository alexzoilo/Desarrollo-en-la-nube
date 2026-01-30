export default function handler(req, res) {
  console.log("Función test ejecutada");
  res.status(200).json({ ok: true });
}
