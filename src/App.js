import React, { useState } from "react";
const XLSX = require('xlsx');
import Table from './table.js';
import { getSpendingTotals, fineGrainedBreakdown, getColumns } from './breakdownFns.js';
import Donut from "./donut.js";
import MyDonut from "./myDonut.js";
import Modal from "./Modal.js";
import InnerModal from "./InnerModal.js";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      name: null,
      clicked: null,
      download: null,
      object: {},
      edit: false,
      legend: true,
      category: null,
      rowCategory: '______',
      dragging: false,
      show: 'none',
      series: [1, 2, 3, 0, 5, 6, 7, 8],
      showSort: false,
      sort: 'A-Z',
      income: 0,
      housing: 0,
      savings: 0,
      isModalOpen: false,
      isInnerModalOpen: false,
      version: false
    }
  }

  addCategory = (val) => {
    if (Object.keys(this.state.object).includes(val)) {
      this.setState({
        category: val,
        show: 'flex'
      })
    }
  }
  setRowCategory = (e) => {
    let val = e.target.value
    this.setState({
      rowCategory: val
    })

  }

  changeRowCategory = (e) => {
    e.preventDefault();
    if (this.state.rowCategory === '') {
      alert('No Category Selected');
    }
    this.closeModal();
    let nodes = this.state.clicked;
    let first = nodes[0].innerHTML;
    let category = nodes[3].innerHTML;
    let amount = nodes[2].innerHTML;
    let totals = { ...this.state.object };
    totals[category] -= amount;
    let files = this.state.file.split('\n')
    let row = 0;
    while (!files[row].includes('Description') && !files[row].includes('"Description"')) {
      row++
    }
    if (first != 'Transaction Date' && first != 'Category') {
      let [dateCol, desCol, catCol, numCol] = getColumns(files[row].split(','));
      let found = false;
      while (found === false && files[row]) {
        row++
        let col = files[row].split(',');
        if (col[catCol] == category || col[catCol].split('-')[0] == category /* split for shortened amex names*/) {
          if (col[numCol] == amount || col[numCol + 1] == amount * -1 || col[numCol] == amount * -1) {
            found = true
            nodes.forEach((n) => n.innerHTML = '')
            console.log('category',this.state.rowCategory)
            console.log('row before', files[row][catCol])
            files[row] = files[row].split(',')
            files[row][catCol] = this.state.rowCategory
            files[row] = files[row].join(',')
            console.log('row after',files[row][catCol])
          }
        }
      }
    }
    files = files.join('\n');
    this.setState({
      file: files
    })
    this.edit();
    this.closeInnerModal();
  }

  removeRow = (e) => {
    e.preventDefault();
    this.closeModal();
    let nodes = this.state.clicked;
    let first = nodes[0].innerHTML;
    let category = nodes[3].innerHTML;
    let amount = nodes[2].innerHTML;
    let totals = { ...this.state.object };
    totals[category] -= amount;
    let files = this.state.file.split('\n')
    let row = 0;
    while (!files[row].includes('Description') && !files[row].includes('"Description"')) {
      row++
    }
    if (first != 'Transaction Date' && first != 'Category') {
      let [dateCol, desCol, catCol, numCol] = getColumns(files[row].split(','));
      let found = false;
      while (found === false && files[row]) {
        row++
        let col = files[row].split(',');
        if (col[catCol] == category || col[catCol].split('-')[0] == category /* split for shortened amex names*/) {
          if (col[numCol] == amount || col[numCol + 1] == amount * -1 || col[numCol] == amount * -1) {
            found = true
            nodes.forEach((n) => n.innerHTML = '')
            files.splice(row, 1)
          }
        }
      }
    }
    files = files.join('\n');
    this.setState({
      file: files
    })
    this.edit();
  }

  edit = () => {
    let edit = this.state.edit
    if (edit) {
      this.editOff();
    } else {
      this.editOn();
    }
    this.setState({
      edit: !edit
    })
  }
  editOn = () => {
    document.getElementById('editButton').id = 'altButton';
    let rows = document.getElementsByClassName('rows');
    for (let i = 0; i < rows.length; i++) {
      rows[i].addEventListener('click', this.openModal);
      rows[i].id = 'hover';
    }
  }
  editOff = () => {
    document.getElementById('altButton').id = 'editButton';
    let rows = document.getElementsByClassName('rows');
    for (let i = 0; i < rows.length; i++) {
      rows[i].removeEventListener('click', this.openModal);
      rows[i].id = 'none'
    }
  }
  cancelEdit = () => {
    this.closeModal();
    this.edit();
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.file !== this.state.file) {
      let totals = getSpendingTotals(this.state.file);
      if (prevState.name !== this.state.name) {
        this.setState({
          download: totals[0], // string
          object: totals[1] // object
        })
      } else {
        this.setState({
          object: totals[1]
        })
      }
      console.log('file change')
    }
    if (prevState.category !== this.state.category) {
      if (this.state.category !== null) { // prevents crash when changing base file (which changes category back to null)
        let totals = getSpendingTotals(this.state.file, this.state.category);
        this.setState({
          download: totals,
          showSort: false
        })
        console.log('category change')
      }
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

  sheetObjectToCSV = (obj) => { // handmade to convert amex xlsx to csv
    let csv = '';
    for (const row in obj) {
      let csvRow = '';
      for (const col in obj[row]) {
        let data = obj[row][col]
        if (typeof data !== 'number') {
          data = data.replace(/\n/g, '')
          data = data.replace(/\r/g, '')
          data = data.replace(/,/g, ' ')
          data = data.replace(/&/g, '+') // fixes issue where amex data & --> &amp
        }
        csvRow += data + ','
      }
      csv += csvRow.slice(0,-1) + '\n'
    }
    return csv
  }

  dragDrop = async (e) => {
    e.preventDefault();
    this.setState({
      dragging: false
    });

    let files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.slice(-4).toLowerCase()  === 'xlsx'){
        const workbook = await this.readFileAsync(file);
        if (workbook) {
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const obj = XLSX.utils.sheet_to_json(sheet);
          const csv = this.sheetObjectToCSV(obj);
          this.setState({
            file: csv,
            name: file.name,
            category: null
          })
          return
        } else {
          alert('Oops, error reading workbook')
        }
      } else if (file.name.slice(-3).toLowerCase()  !== 'csv') {
        alert('Only .csv and .xlsx files are currently supported');
      } else {
        this.fileReaderCode(files);
      }
    }
  };

  readFileAsync = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          // console.log(arrayBuffer)
          const workbook = XLSX.read(arrayBuffer);
          resolve(workbook);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // removes new lines and extra commas from between double quotes, maintaining row format
  removeLineBreaksInQuotes = (input) => {
    input = input.replace(/&/g, '+').replace(/\r/g, '') // fixes carriage returns and issue where amex data & --> &amp
    return input.replace(/"([^"]*)"/g, (match, content) => {
      content = content.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/,/g, '');
      return `"${content}"`;
    });
  };

  fileReaderCode = (input) => {
    let files = input;
    let file, name;
    let readerFiles = '';
    const readFile = (f) => {
      if (!(f instanceof Blob)) {
        alert('Something went wrong, please try again')
        return
      }
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          readerFiles += reader.result;
          readerFiles = this.removeLineBreaksInQuotes(readerFiles);
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

  showTotal = () => {
    let totals = getSpendingTotals(this.state.file);
    this.setState({
      download: totals[0],
      show: 'none'
    })
  }

  getFineGrained = () => {
    let totals = fineGrainedBreakdown(this.state.download);
    if (totals) {
      this.setState({
        download: totals,
        show: 'none',
        showSort: true
      })
    }
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

  importFile = async (e) => {
    let files = e.target.files;
    let file = files[0]
    if (files[0].name.slice(-4).toLowerCase() === 'xlsx') {
      const workbook = await this.readFileAsync(file);
      if (workbook) {
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const obj = XLSX.utils.sheet_to_json(sheet);
        const csv = this.sheetObjectToCSV(obj);
        this.setState({
          file: csv,
          name: file.name,
          category: null
        })
        return
      }
    } else if (e.target.files[0].name.slice(-3).toLowerCase() === 'csv') {
      this.fileReaderCode(files)
    } else {
      alert('Only .csv and .xlsx files currently supported')
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

  openModal = (e) => {
    e.target.parentNode.childNodes.forEach((col) => {
      col.className = 'clicked';
    }
      )
    this.setState({
      isModalOpen: true,
      clicked: e.target.parentNode.childNodes
    });
  };

  closeModal = () => {
    let row = document.getElementsByClassName('clicked');
    for (let i = 0; i < row.length; i++) {
      row[i].id = 'unclicked';
    }
    this.setState({ isModalOpen: false });
  };

  openInnerModal = () => {
    this.setState({
      isInnerModalOpen: true,
    });
  };

  closeInnerModal = () => {
    this.setState({ isInnerModalOpen: false });
  };

  versionChange = (e) => {
    e.preventDefault();
    let ver = !this.state.version
    this.setState({
      version: ver
    })
  }

  handleResize = () => {
    const minWidthForAction = 1080;
    const width = window.innerWidth;
    // const height = window.innerHeight;

    if (width < minWidthForAction && width > 800) {
      this.setState({
        legend: false
      })
    } else {
      this.setState({
        legend: true
      })
    }
  }

  sortChange = () => {
    let val = this.state.sort === '$' ? 'A-Z' : '$'
    let totals = fineGrainedBreakdown(getSpendingTotals(this.state.file, this.state.category), val)
    this.setState({
      sort: val,
      download: totals
    })
  }

  render() {
    let inputMessage;
    if (window.screen.width < 768) {
      inputMessage = "Tap to upload CSV file"
    } else {
      inputMessage = <><strong>Drag and Drop Credit Card Transaction History</strong><br/> or click to browse</>
    }
    // declare variable equal to null that will appear as elements once the requisite data is stored in state
    let [name, totals, downloadButton, table, baseGraph, myGraph, income, housing, showAll, edit, toggle, toolsPlaceholder, sorter] = Array(13).fill(null);
    let list = Object.keys(this.state.object);
      let all = [<option key='base' value=''>Select Category</option>];
      list.forEach((cat) => {
        all.push(<option key={cat} value={cat}>{cat}</option>)
      })
    if (this.state.name) {
      // name = name of imported file
      name = <div>
        Spending Data Generated from:<br/>
        <input className='nameInput' name='name' type='text' placeholder='a' value={this.state.name} onChange={this.inputChange}/>
      </div>
      income = <div>
        <input className='incomeInput' name='income' type='number' placeholder='Add Income' onChange={this.inputChange}/>
        <label id='incomeLabel' htmlFor='income'>&emsp;Calculate Savings</label>
        </div>
      housing = <div>
        <input className='housingInput' name='housing' type='number' placeholder='Add Housing' onChange={this.inputChange}/>
        <label id='housingLabel' htmlFor='housing'>&emsp;Rent/ Mortgage</label>
      </div>
    }
    if (this.state.download) {
      toolsPlaceholder = <div className='totals' style={{ display: this.state.show === 'none' ? 'inline' : 'none' }}>
        <br/>
        <p style={{'color':'grey'}}>
        Choose Category to Show Options
        </p>
      </div>
      let toggleName;
      if (this.state.version) {
        toggleName = 'Detailed'
      } else {
        toggleName = 'Basic'
      }
      toggle = <div id='toggle'><button className='basic' onClick={this.versionChange}>{toggleName}</button></div>
      baseGraph = <div className='donut'>
      <Donut version={this.state.version} legend={this.state.legend}/>
      </div>
      myGraph = <div className='myDonut'>
        <MyDonut totals={this.state.object} series={this.state.series} income={this.state.income} housing={this.state.housing} key={this.state.series.join('_')} change={this.addCategory} legend={this.state.legend}/></div>

      // download button = button to download the table displayed on screen as a csv file to local device
      downloadButton = <button className='special' onClick={this.handleDownloadCSV}>Download Table</button>
      // Assuming this.state.download contains the CSV string
      table = <div className='table' id='table'>
        <Table className="tableDiv" csv={this.state.download}/>
        </div>
    }
    if (this.state.category) {
      // totals = button that shows all transactions from imported csv file aggregated by type/ category
      totals = <button className='basic' onClick={this.getFineGrained}>Group by Vendor</button>
      showAll = <button className='basic' onClick={this.showTotal}>Overview</button>
      edit = <button className='basic' id='editButton' onClick={this.edit}>Edit Table</button>
    }
    if (this.state.showSort) {
      sorter = <span className='sorter'>Sorted By &thinsp;
        <button className='basic' onClick={this.sortChange}>{this.state.sort}</button>
      </span>
    }

    return (
      <div className='grid'>
        <h1 id="nav">$pending Tracker</h1>
        <div className={`drag-drop-input ${this.state.dragging ? 'dragging' : ''}`}
          onDragEnter={this.dragEnter} onDragLeave={this.dragLeave}
          onDragOver={this.dragOver} onDrop={this.dragDrop}>
          {this.file ? (<div>File: {this.name}</div>) :
          (<div className='dragMessage' id='d&d'>{inputMessage}</div>)}
          <input className ='inputButton' type='file' name='file' onChange={this.importFile} multiple/>
          <label htmlFor='file'></label>
        </div>
        <div>
      </div>
        <div className='name'>{name}</div>
        {toggle}
        {baseGraph}
        {myGraph}
        <div className='custom'>{income}{housing}</div>
        {/* <div className='category'></div> */}
        <div className='totals' style={{ display: this.state.show }}>Table Tools<br/>
          <span>{showAll}{totals}{edit}</span>
        </div>
        {toolsPlaceholder}
        {sorter}
        <div className='tableBox'>{table}</div>
        <div className='downloadButton'>{downloadButton}</div>
        <Modal isOpen={this.state.isModalOpen} closeModal={this.cancelEdit}>
          <h2>What do you want to do with this item?</h2>
            <br/>
          <span>
          <button className='basic' id='altButton' style={{'backgroundColor': 'red'}} onClick={this.removeRow}>Remove</button>
          <button className='basic' style={{'backgroundColor': 'orange'}} onClick={this.openInnerModal}>Change Category</button>
          <button className='basic' style={{'backgroundColor': 'green'}} onClick={this.cancelEdit}>Cancel</button>
          </span>
        </Modal>
        <InnerModal isOpen={this.state.isInnerModalOpen} closeModal={this.closeInnerModal}>
          <div className='innerModalOptions'>
          <p>Move item from <b>{this.state.category}</b> to <br/><strong>{this.state.rowCategory}</strong></p>
            <select className='categoryWheel' name="category" onChange={this.setRowCategory}>
              {all}
            </select>
            <br/>
            <label id='categoryLabel' htmlFor='category'>Or</label>
            <br/>
            <input className='categoryInput' name='rowCategory' type='text' placeholder='Enter Custom Category' onChange={this.inputChange} maxLength="40" />
            <button className='basic' onClick={this.changeRowCategory}>Move</button>
          </div>

        </InnerModal>
      </div>
    );
  }
}


  export default App;
