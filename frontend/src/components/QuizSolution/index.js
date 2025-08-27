
import React, { useEffect, useMemo, useState} from "react";
import { useGlobalFilter, useSortBy, useTable, useFilters } from "react-table";

import styles from './index.module.css'
import Table from 'react-bootstrap/Table';

export default function PreQuizSolutions({questions, yourScore}) {

  const [data, setData] = useState(questions)
  const [pass, setPass] = useState(questions.length == yourScore);

  useEffect( () => {
    setData(questions)
    setPass(questions.length == yourScore)
  }, [questions]);

  const tableData = useMemo(() => [...data], [data]);
  
  const filteredItem = ["choices", "hint", "comment", "question"];
  const columnOrder = [ "id", "yourAnswer", "answer", , "comment", "hint", "question", "review"];

  const questionsColumns = useMemo(
    () =>
      data[0]
        ? Object.keys(data[0])
            // .filter((key) => key !== "rating")
            .filter((key) => !filteredItem.includes(key) )
            .map((key, index) => {
              if (key === "answer")
              return {
                Header: "Correct Answer",
                accessor: key,
                Cell: ({ value }) => <div style={{display: "flex", justifyContent: "center", alightItems: "center",  height: "100%"}}><div style={{  padding: "auto", margin: "auto 0"}}>{value.isCorrect ? value.answer : "?"}</div></div>,
                maxWidth: 10,
              };
              if (key === "yourAnswer")
              return {
                Header: "Your Answer",
                accessor: key,
                Cell: ({ value }) => <div style={{ display: "flex", justifyContent: "center", alightItems: "center",  height: "100%"}}><div style={{  padding: "auto", margin: "auto 0"}}>{value}</div></div>,
                maxWidth: 10,
              };

              if (key === "review")
              return {
                Header: "Clues",
                accessor: key,
                Cell: ({ value }) => <div style={{ display: "flex", justifyContent: "center", alightItems: "center",  height: "100%"}}><div style={{  padding: "auto", margin: "auto 0"}}>{ value.isCorrect ? value.correct : value.hint}</div></div>,
                maxWidth: 70,
              };
              if (key === "id")
              return {
                Header: "Question No.",
                accessor: key,
                Cell: ({ value }) => <div style={{ display: "flex", justifyContent: "center", alightItems: "center",  height: "100%"}}><div style={{  padding: "auto", margin: "auto 0"}}>{value}</div></div>,
                maxWidth: 70,
              };
              if (key === "hint")
              return {
                Header: "Hint",
                accessor: key,
                Cell: ({ value }) => <div style={{ display: "flex", justifyContent: "center", alightItems: "center",  height: "100%"}}><div style={{  padding: "auto", margin: "auto 0"}}>{value}</div></div>,
                maxWidth: 70,
              };
              if (key === "question")
              return {
                Header: "Question",
                accessor: key,
                Cell: ({ value }) => <div style={{ display: "flex", justifyContent: "center", alightItems: "center",  height: "100%"}}><div style={{  padding: "auto", margin: "auto 0"}}>{value}</div></div>,
                maxWidth: 70,
              };

              return { Header: key, accessor: key };
            }).sort((a,b) => {
              return columnOrder.indexOf(a.accessor) - columnOrder.indexOf(b.accessor)
            })
        : [],
    [data]
  );

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      ...columns,
      // {
      //   id: "Edit",
      //   Header: "Edit",
      //   Cell: ({ row }) => (
      //     <button onClick={() => alert("Editing: " + row.values.price)}>
      //       Edit
      //     </button>
      //   ),
      // },
    ]);
  };

  const tableInstance = useTable(
    {
      columns: questionsColumns,
      data: tableData,
    },
    useGlobalFilter,
    tableHooks,
    useFilters,
    useSortBy,
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = tableInstance;

  const isEven = (idx) => idx % 2 === 0;
  return (
    <div className={styles.tableContainer}>
        { pass 
        ? 
        <div className={styles.tableMessagePassed}>
          <p>Thank you. You answered all the questions correctly. You can now join the exercise.</p>
        </div>
        :
        <div className={styles.tableMessage}>
          <ul className={styles.paragraph}>
          <li>  You have correctly answered {yourScore} question{ yourScore > 1 ? "s" : null}. </li>
          <li>  Note that you need to correctly answer all questions in order to proceed to the decision exercise. You can re-try the quiz until you correctly answer all quiz questions. </li>
            <li>  You will earn $1 for completing the quiz.</li>
          </ul>
        </div>
        }
      <Table {...getTableProps()} className={styles.table}>
        <thead className={styles.head}>
          {headerGroups.map((headerGroup, id) => (
            <tr className={styles.row} {...headerGroup.getHeaderGroupProps()} 
        
            key={headerGroup +  id}>
              {headerGroup.headers.map((column, idx) => (
                <th
                className={styles.tablehead} 
                  {...column.getHeaderProps(column.getSortByToggleProps())} key={column +  idx}
                >
                  {column.render("Header")}
                  {column.isSorted ? (column.isSortedDesc ? " ▼" : " ▲") : " "+" "+ " "+ " "}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className={ styles.body} {...getTableBodyProps()}>
          {
          rows.map((row, idx) => {
            prepareRow(row);
            return (
                <tr
                  {...row.getRowProps()}
                  // className={ styles.card}
                  key={row +  idx}
                  style={{backgroundColor: "#ffe7aa"}}
                >
                  {row.cells.map((cell, id) => (
                    <td className={styles.cell} style={{         
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      backgroundColor: data[idx]?.["answer"]?.["isCorrect"] ? "#b7e597" : "#ffe7aa",
                      // width: "33%",
                      verticalAlign: "center"
                    }} {...cell.getCellProps()}  key={cell +  id} data-label={headerGroups[0]?.headers[id].Header}>
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

