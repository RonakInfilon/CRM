
const Table=({children,className})=>{
  return(
    <table className={`min-w-full ${className || ""}`}>
      {children}
    </table>
  );
};

const TableHeader=({children,className})=>{
  return(
    <thead className={className}>
      {children}
    </thead>
  )
}


const TableBody=({children,className})=>{
  return(
    <tbody className={className}>
      {children}
    </tbody>
  )
}


const TableRow = ({ children, className, ...props }) => {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  )
}


const TableCell = ({ children, className, isHeader = false, ...props }) => {
  const Celltag = isHeader ? "th" : "td";
  return (
    <Celltag className={className} {...props}>
      {children}
    </Celltag>
  );
};

export{
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader
}