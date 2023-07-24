import React, { useState } from "react";
import { FileReader } from "react";
import Table from './table.js';
import Papa from 'papaparse';
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
      series: [1,2,3,0,5,6,7,8],
      income: 0,
      housing: 0,
      savings: 0
    }
  }

  addCategory = (e) => {
    e.preventDefault();
    let val = e.target.value
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

  componentDidUpdate(prevProps, prevState) {
    if (prevState.category !== this.state.category) {
      let totals = getSpendingTotals(this.state.file, this.state.category);
      this.setState({
        download: totals
      })
    }
    if (prevState.file !== this.state.file) {
      let totals = getSpendingTotals(this.state.file);
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


  dragDrop = (e) => {
    e.preventDefault();
    this.setState({
      dragging: false
    })
    if (e.dataTransfer.files[0].name.slice(-3) !== 'csv') {
      alert('Only .csv files currently supported')
    } else {
      this.fileReaderCode(e.dataTransfer.files)
    }
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
    if (name.slice(-3) !== "csv") {
      name += '.csv'
    }
    link.download = name;
    link.click();
  };

  importFile = (e) => {
    if (e.target.files[0].name.slice(-3) !== 'csv') {
      alert('Only .csv files currently supported')
    } else {
      this.fileReaderCode(e.target.files)
    }
  }

  inputChange = (e) => {
    e.preventDefault();
    let state = e.target.name;
    let val = e.target.value;
    this.setState({
      [state]: val
    })
  }

  render() {
    // declare variable equal to null that will appear as elements once the requisite data is stored in state
    let [name, totals, fine, downloadButton, category, specifics, table, baseGraph, myGraph, custom] = Array(10).fill(null);
    if (this.state.name) {
      // name = name of imported file
      name = <div>
        Spending Data Generated from:<br/>
        <input className='nameInput' name='name' type='text' placeholder='a' value={this.state.name} onChange={this.inputChange}/>
      </div>
      custom = <div>
        <div>
          <input className='incomeInput' name='income' type='number' placeholder='3000' value={this.state.income} onChange={this.inputChange}/>
          <label id='incomeLabel' htmlFor='income'>&emsp;Update Income</label>
        </div>
        <div>
          <input className='housingInput' name='housing' type='number' placeholder='1500' value={this.state.housing} onChange={this.inputChange}/>
          <label id='housingLabel' htmlFor='housing'>&emsp;Update Housing Cost</label>
        </div>
      </div>
    }
    if (this.state.download) {
      baseGraph = <div className='donut'>Suggested Budget<br/><Donut version='1'/></div>
      myGraph = <div className='myDonut'>My Spending<br/>
        <MyDonut totals={this.state.object} series={this.state.series} income={this.state.income} housing={this.state.housing} key={this.state.series.join('_')}/></div>
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
      // Assuming this.state.download contains the CSV string
      const parsedData = Papa.parse(this.state.download, { header: true });
      const data = parsedData.data;
      table = <div className="tableDiv">
      <Table csv={this.state.download}/>
      </div>
    }
    if (this.state.category) {
      // totals = button that shows all transactions from imported csv file aggregated by type/ category
      totals = <button style={{ display: this.state.show }} onClick={this.getFineGrained}>Combine Payments</button>
    }

    return (
      <div className='grid'>
        <h1 id="nav">$pending Tracker</h1>
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
        <div className='custom'>{custom}</div>
        <div className='specifics'>{specifics}</div>
        <div className='downloadButton'>{downloadButton}</div>
        <div className='category'>{category}</div>
        <div className='table'>{table}</div>
      </div>
    );
  }
}


  export default App;
