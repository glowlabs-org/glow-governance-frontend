import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import React from 'react'

export type GenericTableProps = {
  labels: string[]
  tableCaption: string
  values: (string | number)[][]
}
export const GenericTable = (args: GenericTableProps) => {
  return (
    <Table className="bg-white rounded-lg">
      <TableCaption>{args.tableCaption}</TableCaption>
      <TableHeader>
        <TableRow>
          {args.labels.map((label) => (
            <TableHead key={label}>{label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {args.values.map((row) => (
          <TableRow key={row[0]}>
            {row.map((cell) => (
              <TableCell key={cell}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
