import React, { useState } from "react";
import { FileReader } from "react";
import { CsvToHtmlTable } from "react-csv-to-table";
import { getSpendingTotals, fineGrainedBreakdown } from './breakdownFns.js';
import Donut from "./donut.js";
import MyDonut from "./myDonut.js"


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      name: null,
      download: null,
      object: {},
      category: null,
      categories: null,
      dragging: false,
      show: 'block',
      series: [1,2,3,4,5,6,7,8]
    }
  }


  addCategory = (e) => {
    e.preventDefault();
    let val = e.target.value
    console.log('val here', val)
    if (Object.keys(this.state.object).includes(val)) {
      this.setState({
        category: val,
        show: 'block'
    })
    } else {
      let totals = getSpendingTotals(this.state.file);
      this.setState({
        download: totals[0]
      })
    }
  }

  dragEnter = (e) => {
    e.preventDefault();
    this.setState({
      dragging: true
    })
  };

  dragLeave = (e) => {
    e.preventDefault();
    this.setState({
      dragging: false
    })
  };

  dragOver = (e) => {
    e.preventDefault();
  };

  fileReaderCode = (input) => {
    let files = input;
    let file, name;
    let readerFiles = '';
    const reader = new window.FileReader();
    const readFile = (f) => {
      return new Promise((resolve, reject) => {
        const reader = new window.FileReader();
        reader.onload = () => {
          readerFiles += reader.result;
          this.setState({
            file: readerFiles,
            name: name,
            category: null
          })
        };
        reader.onerror = (event) => {
          reject(event.target.error);
        };
        reader.readAsText(f);
      });
      console.log('ReadFile Running')
    };
    reader.onload = () => {
      readerFiles += reader.result;
      this.setState({
        file: readerFiles,
        name: name,
        category: null
      })
    };

    if (files[1] !== undefined) {
      for (const file of files) {
        const handleFileChange = async (f) => {
          try {
            await readFile(f);
          } catch (error) {
            console.log('Error reading file:', error);
          }
      };
      handleFileChange(file)
      }
      name = 'Multiple Files'
    } else {
      file = files[0]
      name = file.name;
      readFile(file)
    }
  }

  dragDrop = (e) => {
    e.preventDefault();
    this.setState({
      dragging: false
    })
    this.fileReaderCode(e.dataTransfer.files)
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.category !== this.state.category) {
      let totals = getSpendingTotals(this.state.file, this.state.category);
      this.setState({
        download: totals
      })
    }
    if (prevState.file !== this.state.file) {
      let totals = getSpendingTotals(this.state.file);
      let series = this.state.series;
      let internet = totals[1].Internet || 0;
      let gas = Math.floor(totals[1]['Gas/Automotive']) || 0;
      let air = Math.floor(totals[1].Airfare) || 0;
      series[1] = Math.floor(totals[1].Insurance) || 0;
      series[2] = Math.floor(totals[1].Dining) || 0;
      series[4] = internet + totals[1]['Phone/Cable'];
      series[5] = gas + air;
      series[6] = Math.floor(totals[1]['Health Care']) || 0;
      series[7] = Math.floor(totals[1].Merchandise) || 0;
      console.log('series1', series[1])
      this.setState({
        series: series
      })
      this.setState({
        download: totals[0],
        object: totals[1]
      })
    }
    // this code is so that the name input box doesn't disappear if you delete all the text
    if (this.state.name === '') {
      this.setState({
        name: ' '
    })
    }
  }

  getTotals = (e) => {
    e.preventDefault();
    let totals = getSpendingTotals(this.state.file);
    this.setState({
      download: totals[0],
      object: totals[1]
    })
  }

  getSpecifics = () => {
    let totals = getSpendingTotals(this.state.file, this.state.category);
    this.setState({
      download: totals
    })
  }

  getFineGrained = () => {
    let totals = fineGrainedBreakdown(this.state.download);
    this.setState({
      download: totals,
      show: 'none'
    })
  }

  handleDownloadCSV = (e) => {
    e.preventDefault();
    const blob = new Blob([this.state.download], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    let name = this.state.name
    console.log(name,name.slice(-3))
    if (name.slice(-3) !== "csv") {
      name += '.csv'
    }
    link.download = name;
    link.click();
  };

  importFile = (e) => {
    this.fileReaderCode(e.target.files)
  }

  nameChange = (e) => {
    e.preventDefault();
    let val = e.target.value + '';
    this.setState({
      name: val
    })
  }

  render() {
    // declare variable equal to null that will appear as elements once the requisite data is stored in state
    let [name, totals, fine, downloadButton, category, specifics, table, baseGraph, myGraph] = Array(9).fill(null);
    if (this.state.name) {
      // name = name of imported file
      name = <div>
        Spending Data Generated from:<br/>
        <input className='nameInput' type='text' placeholder='a' value={this.state.name} onChange={this.nameChange}/>
      </div>
    }
    if (this.state.download) {
      baseGraph = <div className='donut'>Suggested Budget<br/><Donut/></div>
      myGraph = <div className='myDonut'>My Spending<br/><MyDonut series={this.state.series}/></div>
      // Housing, Insurance, Food, Savings, Utilities, Transportation, Needs, Wants
      let list = Object.keys(this.state.object);
      let all = [<option key='base' value={null}>All</option>];
      list.forEach((cat) => {
        all.push(<option key={cat} value={cat}>{cat}</option>)
      })
      // category = selector dropdown of all payment categories from initial csv file
      category =
        <form>
          <select className='categoryWheel' name="category" onChange={this.addCategory}>
            {all}
          </select>
          <label id='categoryLabel' htmlFor='category'>&emsp;Show</label>
        </form>
      // download button = button to download the table displayed on screen as a csv file to local device
      downloadButton = <button onClick={this.handleDownloadCSV}>Download Table</button>
      table = <div className="tableDiv">
        <CsvToHtmlTable
          data={this.state.download}
          csvDelimiter=","
        />
      </div>
    }
    if (this.state.category) {
      // totals = button that shows all transactions from imported csv file aggregated by type/ category
      totals = <button style={{ display: this.state.show }} onClick={this.getFineGrained}>Combine Payments</button>
    }

    return (
      <div>
        <h1>
          <span id="nav">&ensp;<a id="home" onClick={this.startPage}>Spending Tracker</a></span><br />
        </h1>
        <div className='grid'>
        <div className={`drag-drop-input ${this.state.dragging ? 'dragging' : ''}`}
          onDragEnter={this.dragEnter} onDragLeave={this.dragLeave}
          onDragOver={this.dragOver} onDrop={this.dragDrop}>
          {this.file ? (<div>File: {this.name}</div>) :
          (<div className='dragMessage'><strong>Drag and Drop Credit Card or Bank Statement(s)</strong><br/> or click to browse</div>)}
          <input className ='inputButton' type='file' name='file' onChange={this.importFile} multiple/>
          <label htmlFor='file'></label>
        </div>
        {baseGraph}
        {myGraph}
        <div className='name'>{name}</div>
        <div className='totals'>{totals}</div>
        <div className='specifics'>{specifics}</div>
        <div className='downloadButton'>{downloadButton}</div>
        <div className='category'>{category}</div>
        <div className='table'>{table}</div>
        </div>
      </div>
    );
  }
}


  export default App;
