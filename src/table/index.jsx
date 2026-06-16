import React from "react";

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


const TableRow=({children,className})=>{
  return(
    <tr className={className}>
      {children}
    </tr>
  )
}


const TableCell=({children,className,isHeader=false})=>{
  const Celltag=isHeader?"th":"td";
  return(
    <Celltag className={className}>
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