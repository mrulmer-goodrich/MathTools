export default function Fraction({numerator,denominator,children}){
  return (
    <div className="fraction">
      <div>{numerator}</div>
      <div className="frac-bar"></div>
      <div>{denominator}</div>
      {children}
    </div>
  )
}
