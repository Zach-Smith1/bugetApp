export function getColumns(allColumns) {
  "Transaction Date,Description,Category,Debit\n";
  let [dateCol, desCol, catCol, numCol] = Array(4).fill(0);
  while (allColumns[dateCol] !== 'Transaction Date' && allColumns[dateCol] !== '"Posted Transactions"' && allColumns[dateCol] !== 'Date' && allColumns[dateCol] !== '"Transaction Date"' && dateCol < 10) {
    dateCol++
  }
  while (allColumns[desCol] !== 'Description' && allColumns[desCol] !== '"Description"' && desCol < 10) {
    desCol++
  }
  while (allColumns[catCol] !== 'Category' && allColumns[catCol] !== '"Category"' && catCol < 10) {
    catCol++
  }
  while (allColumns[numCol] !== 'Amount' && allColumns[numCol] !== '"Amount"' && allColumns[numCol] !== 'Debit' && allColumns[numCol] !== 'Amount (USD)' && numCol < 10) {
    numCol++
  }
  return [dateCol, desCol, catCol, numCol]
}

export function getSpendingTotals(file, category) {
  console.log(`getSpendingTotals is parsing csv file...`);
  let allRows = file.split('\n')
  let colRow = 0;
  let card = 'unknown';
  while (!allRows[colRow].split(',').includes('Description') && !allRows[colRow].split(',').includes('"Description"')) {
    colRow++
  }
  const columnNames = allRows[colRow].split(',')
  if (columnNames[6] === 'Memo') {
    card = 'Chase'
  }

  let [dateCol, desCol, catCol, numCol] = getColumns(columnNames);

  allRows = allRows.slice(colRow + 1);
  // create output object for this function to return
  const totals = {};
  // boolean variable to keep track of adding column names to output file
  let head = true;
  let finalCsv = '';
  allRows.forEach((row) => {
    let rowArr = row.split(',');
    // if row is blank or if multiple files have caused there to be a header row in the middle (rowArr[3] === Description), skip row
    if (rowArr[3] === 'Description' || rowArr[catCol] === undefined || rowArr[3].slice(0, 11) === "CAPITAL ONE") {
      return
    }
    // if there's a credit change it to a negative debit (for Capital One)
    if (rowArr[numCol + 1] > 0 && columnNames[6] === 'Credit') {
      rowArr[numCol] = '-' + rowArr[6]
    }
    let rowObj = {};

    let number = rowArr[numCol]
    if (number.includes('"')) number = number.replace(/"/g, '');
    // account for chase card negative amounts:
    if (card === 'Chase') {
      if (rowArr[catCol] === '') {
        return
      }
      number = number * -1
    }

    for (let i = Math.min(catCol, numCol); i <= Math.max(catCol, numCol); i++) {
      // logs relevant data for category in question
      if (category && rowArr[i] === category) {
        // console.log(rowArr[i - 1], rowArr[i + 1])
        if (head === true) {
          finalCsv = "Transaction Date,Description,Category,Debit\n";
          head = false
        }
        finalCsv += `${rowArr[dateCol]},${rowArr[desCol]},${rowArr[catCol]},${number}\n`;
      }
      rowObj[columnNames[i]] = rowArr[i];
    }


    /* each row of is represented as key value pair in the final object, the key is the item number, the value
     is an object of column names (keys) and values */
    if (totals.hasOwnProperty(rowObj[columnNames[catCol]])) {
      totals[rowObj[columnNames[catCol]]] += Number(number)
    } else {
      totals[rowObj[columnNames[catCol]]] = Number(number)
    }
  })
  // if getting specific category breakdown return (only spending from that category)
  if (category) {
    return finalCsv
  }
  for (let name in totals) {
    // round totals to next highest cent
    let rows = `${name}, ${Number(totals[name].toFixed(2))}\n`;
    // store as csv formatted string
    finalCsv += rows;
  }
  //return totals as csv with header added and as an object (to use keys for category selector wheel)
  return ["Category, $ Spent\n" + finalCsv, totals]
}

export function fineGrainedBreakdown(file) {
  console.log(`fineGrainedBreakdown is parsing payments...`);
  let allRows = file.split('\n')
  if (allRows[0].split(',').length < 3) {
    alert("Something went wrong, already Grouped!")
    return null
  }
  allRows = allRows.slice(1);
  const [desCol, numCol] = [1, 3];
  const totals = {};

  // check for numbers in establishment names and remove them to make a common name
  let numbers = ['#', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  let finder = true;
  allRows.forEach((row) => {
    let rowArr = row.split(',');
    if (rowArr[desCol] === undefined) return
    let name = rowArr[desCol];
    name = name.replace(/_/g, ' ');
    name = name.replace(/\*/g, ' ');
    name = name.split(' ');
    let simpleName = [name[0]];
    for (let i = 1; i < name.length; i++) {
      finder = true;
      for (let j = 0; j < name[i].length; j++) {
        if (numbers.includes(name[i][j])) {
          finder = false;
          break;
        }
      }
      if (finder) simpleName.push(name[i]);
    }
    simpleName = simpleName.join(' ');
    let number = rowArr[numCol]
    if (totals.hasOwnProperty(simpleName)) {
      totals[simpleName] += Number(number)
    } else {
      totals[simpleName] = Number(number)
    }
  })
  // below code is to add the totals to a final output in alphabetical order
  let breakdown = [];
  for (let key in totals) {
    let newRow = `${key}, ${Number(totals[key].toFixed(2))}\n`;
    breakdown.push(newRow);
  }
  breakdown.sort((a, b) => {
    const nameA = a.toUpperCase(); // ignore upper and lowercase
    const nameB = b.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  return "Establishment, $ Spent\n" + breakdown.join('')
}

