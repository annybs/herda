export default function Copyright() {
  const year = new Date().getFullYear()

  return (
    <div className="copyright">
      &copy; <span className="year">{year}</span> Herda
    </div>
  )
}
