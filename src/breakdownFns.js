export function getColumns(allColumns) {
  "Transaction Date,Description,Category,Debit\n";
  let [dateCol, desCol, catCol, numCol] = Array(4).fill(0);
  while (allColumns[dateCol] !== 'Transaction Date' && allColumns[dateCol] !== '"Posted Transactions"' && allColumns[dateCol] !== 'Date' && allColumns[dateCol] !== '"Transaction Date"' && dateCol < 14) {
    dateCol++
  }
  while (allColumns[desCol] !== 'Description' && allColumns[desCol] !== '"Description"' && desCol < 14) {
    desCol++
  }
  while (allColumns[catCol] !== 'Category' && allColumns[catCol] !== '"Category"' && catCol < 14) {
    catCol++
  }
  while (allColumns[numCol] !== 'Amount' && allColumns[numCol] !== '"Amount"' && allColumns[numCol] !== 'Debit' && allColumns[numCol] !== 'Amount (USD)' && numCol < 14) {
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
  if (columnNames[columnNames.length - 1] === 'Memo') { // if last column name is memo card type === Chase
    card = 'Chase'
  }

  let [dateCol, desCol, catCol, numCol] = getColumns(columnNames);

  allRows = allRows.slice(colRow + 1);
  const totals = {};
  let head = true; // boolean variable to keep track of adding column names to output file
  let finalCsv = '';

  allRows.forEach((row) => {
    let rowArr = row.split(',');

    // if row is blank or if multiple files have caused there to be a header row in the middle (rowArr[3] === Description), skip row
    if (rowArr[3] === 'Description' || rowArr[catCol] === undefined || rowArr[catCol].length === 0 || rowArr[3].slice(0, 11) === "CAPITAL ONE") {
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
      if (i === catCol) {
        if (rowArr[i].includes('-')) { // for amex category names (too many & too long)
          rowArr[i] = rowArr[i].split('-')[0]
        }
      }
      if (category && rowArr[i] === category) {
        if (head === true) {
          finalCsv = "Transaction Date,Description,Charge,Category\n";
          head = false
        }
        finalCsv += `${rowArr[dateCol]},${rowArr[desCol]},${number},${rowArr[catCol]}\n`;
      }
      rowObj[columnNames[i]] = rowArr[i];
    }


    /* each row of is represented as key value pair in the final object, the key is the item number, the value
     is an object of column names (keys) and values */
    let catColumn = rowObj[columnNames[catCol]]
    if (totals.hasOwnProperty(catColumn)) {
      totals[catColumn] += Number(number)
    } else {
      totals[catColumn] = Number(number)
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

export function fineGrainedBreakdown(file, sort) {
  console.log(`fineGrainedBreakdown is parsing payments...`);
  let allRows = file.split('\n')
  if (allRows[0].split(',').length < 3) {
    alert("Something went wrong, already Grouped!")
    return null
  }
  allRows = allRows.slice(1);
  const [desCol, numCol] = [1, 2];
  const totals = {};

  // check for numbers in establishment names and remove them to make a common name
  let numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let prefixes = ['pp', 'tst', 'sq', 'aplpay']
  let finder = true;
  allRows.forEach((row) => {
    let rowArr = row.split(',');
    if (rowArr[desCol] === undefined) return
    let name = rowArr[desCol];
    name = name.replace(/_/g, ' ');
    name = name.replace(/\*/g, ' ');
    name = name.replace(/#/g, ' ');
    name = name.split(' ');
    if (prefixes.includes(name[0].toLowerCase())) name.shift()
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
    simpleName = simpleName.filter((word) => word !== '');
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
    breakdown.push(`${key}, ${Number(totals[key].toFixed(2))}\n`);
  }
  breakdown.sort((a, b) => {
    const nameA = sort === '$' ? Number(b.split(',')[1]) : a.toUpperCase();
    const nameB = sort === '$' ? Number(a.split(',')[1]) : b.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  console.log('sorting...')
  return "Establishment, $ Spent\n" + breakdown.join('')
}

