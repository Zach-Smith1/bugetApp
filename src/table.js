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

  formattedNumber = (num) => {
    return num !== undefined && !isNaN(num) ? Number(num).toLocaleString('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    }) : ' No Data Found '
  };

  cellMapper = (c, i) => {
    if (!isNaN(Number(c))) {
      return <td key={i} style={{'textAlign':'right'}}>{this.formattedNumber(c)}&thinsp;</td>
    } else {
      return <td key={i} style={{'textAlign':'left'}}>&thinsp;{c}</td>
    }
  }


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
                this.cellMapper(cell, cellIndex)
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default Table;
