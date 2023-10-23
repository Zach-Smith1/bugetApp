import React, { useState } from "react";
// import { FileReader } from "react";
import Table from './table.js';
import { getSpendingTotals, fineGrainedBreakdown, getColumns } from './breakdownFns.js';
import Donut from "./donut.js";
import MyDonut from "./myDonut.js";
import Modal from "./Modal.js";


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
      categories: null,
      dragging: false,
      show: 'none',
      series: [1, 2, 3, 0, 5, 6, 7, 8],
      income: 0,
      housing: 0,
      savings: 0,
      isModalOpen: false,
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

  yesRemove = (e) => {
    e.preventDefault();
    this.closeModal();
    let nodes = this.state.clicked;
    let first = nodes[0].innerHTML;
    let category = nodes[2].innerHTML;
    let amount = nodes[3].innerHTML;
    let totals = { ...this.state.object };
    totals[category] -= amount;
    let files = this.state.file.split('\n')
    let row = 0;
    if (first != 'Transaction Date' && first != 'Category') {
      let [dateCol, desCol, catCol, numCol] = getColumns(files[0].split(','));
      let found = false;
      console.log(files[0])
      while (found === false && files[row]) {
        row++
        let col = files[row].split(',');
        if (col[catCol] == category) {
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
      let totals = getSpendingTotals(this.state.file, this.state.category);
      this.setState({
        download: totals
      })
      console.log('category change')
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
    if (e.dataTransfer.files[0].name.slice(-3).toLowerCase() !== 'csv') {
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
      if (!(f instanceof Blob)) {
        alert('Something went wrong, please try again')
        return
      }
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
        show: 'none'
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

  openModal = (e) => {
    this.setState({
      isModalOpen: true,
      clicked: e.target.parentNode.childNodes
    });
    console.log(e.target.parentNode.childNodes)
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
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

  render() {
    let inputMessage;
    if (window.screen.width < 768) {
      inputMessage = "Tap to upload CSV file"
    } else {
      inputMessage = <><strong>Drag and Drop Credit Card Transaction History</strong><br/> or click to browse</>
    }
    // declare variable equal to null that will appear as elements once the requisite data is stored in state
    let [name, totals, downloadButton, table, baseGraph, myGraph, income, housing, showAll, edit, toggle] = Array(11).fill(null);
    if (this.state.name) {
      // name = name of imported file
      name = <div>
        Spending Data Generated from:<br/>
        <input className='nameInput' name='name' type='text' placeholder='a' value={this.state.name} onChange={this.inputChange}/>
      </div>
      income = <div>
        <input className='incomeInput' name='income' type='number' placeholder='3000' value={this.state.income} onChange={this.inputChange}/>
        <label id='incomeLabel' htmlFor='income'>&emsp;Add Income</label>
        </div>
      housing = <div>
        <input className='housingInput' name='housing' type='number' placeholder='1500' value={this.state.housing} onChange={this.inputChange}/>
        <label id='housingLabel' htmlFor='housing'>&emsp;Add Housing</label>
      </div>
    }
    if (this.state.download) {
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
      let list = Object.keys(this.state.object);
      let all = [<option key='base' value={null}>All</option>];
      list.forEach((cat) => {
        all.push(<option key={cat} value={cat}>{cat}</option>)
      })

      // **** DEPRECATED***** selector dropdown wheel of all payment categories from initial csv file
      // category =
      // <form>
      //     <select className='categoryWheel' name="category" onChange={this.addCategory}>
      //       {all}
      //     </select>
      //     <label id='categoryLabel' htmlFor='category'>&emsp;Show</label>
      //   </form>

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
        {table}
        <div className='downloadButton'>{downloadButton}</div>
        <Modal isOpen={this.state.isModalOpen} closeModal={this.cancelEdit}>
          <h2>Do you want to remove this item?</h2>
            <br/>
          <span>
          <button className='basic' id='altButton' onClick={this.yesRemove}>Remove</button>
          <button className='basic' onClick={this.cancelEdit}>Cancel</button>
          </span>
        </Modal>
      </div>
    );
  }
}


  export default App;
