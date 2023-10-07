import React from "react";
import Papa from "papaparse";

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],
    };
  }

  componentDidMount() {
    this.parseCSVData(this.props.csv);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.csv !== this.props.csv) {
      this.parseCSVData(this.props.csv);
    }
  }

  parseCSVData = (csvData) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        this.setState({
          tableData: results.data,
        });
      },
    });
  };

  render() {
    const { tableData } = this.state;

    return (
      <table>
        <thead>
          <tr>
            {tableData.length > 0 &&
              Object.keys(tableData[0]).map((column) => (
                <th key={column}>{column}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex} className='rows'>
              {Object.values(row).map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default Table;
