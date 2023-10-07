export function getSpendingTotals(file, category) {
  console.log(`getSpendingTotals is parsing csv file...`);
  // const dataString = fs.readFileSync(file, "utf8");
  // // split raw data into rows
  // let allRows = dataString.split('\n');
  let allRows = file.split('\n')
  // const columnNames = allRows[0].split(',');
  const columnNames = allRows[0].split(',')
  // omit column names from array of rows
  allRows = allRows.slice(1);
  // create output object for this function to return
  const totals = {};
  // boolean variable to keep track of adding column names to output file
  let head = true;
  let finalCsv = '';
  allRows.forEach((row) => {
    let rowArr = row.split(',');
    // if row is blank or if multiple files have caused there to be a header row in the middle (rowArr[3] === Description), skip row
    if (rowArr[3] === 'Description' || rowArr[4] === undefined || rowArr[3].slice(0,11) === "CAPITAL ONE") {
      return
    }
    // if there's a credit change it to a negative debit (for Capital One)
    if (rowArr[6] > 0) {
      rowArr[5] = '-'+rowArr[6]
    }

    let rowObj = {};
    // pair column names and values as key value pairs
    for (let i = 4; i < 6; i++) {
      // logs relevant data for category in question
      if (category && rowArr[i] === category) {
        // console.log(rowArr[i - 1], rowArr[i + 1])
        if (head === true) {
          finalCsv = "Transaction Date,Description,Category,Debit\n";
          head = false
        }
        finalCsv += `${rowArr[0]},${rowArr[3]},${rowArr[4]},${rowArr[5]}\n`;
      }
      rowObj[columnNames[i]] = rowArr[i];
  }
    /* each row of is represented as key value pair in the final object, the key is the item number, the value
     is an object of column names (keys) and values */
    if (totals.hasOwnProperty(rowObj[columnNames[4]])) {
      totals[rowObj[columnNames[4]]] += Number(rowArr[5])
    } else {
      totals[rowObj[columnNames[4]]] = Number(rowArr[5])
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
  return ["Category, $ Spent\n"+finalCsv,totals]
}

export function fineGrainedBreakdown(file) {
  console.log(`fineGrainedBreakdown is parsing payments...`);
  // split raw data into rows
  let allRows = file.split('\n')
  if (allRows[0].split(',').length < 3) {
    alert("Something went wrong, already Grouped!")
    return null
  }
  let headerRow = 0;
  const columnNames = allRows[headerRow].split(',');
  // omit column names from array of rows
  allRows = allRows.slice(headerRow + 1);
  // create output string for this function to return
  const totals = {};
  // iterate through the rows and add them to the new object only if the item has
  let descriptionCol = 0;
  while (columnNames[descriptionCol] !== 'Description') {
    descriptionCol ++
  }
  let debitCol = 0;
  while (columnNames[debitCol] !== 'Debit') {
    debitCol ++
  }
  // check for numbers in establishment names and remove them to make a common name
  let numbers = ['#','1','2','3','4','5','6','7','8','9','10'];
  let finder = true;
  allRows.forEach((row) => {
    let rowArr = row.split(',');
    if (rowArr[descriptionCol] === undefined) return
    let name = rowArr[descriptionCol];
    name = name.split(' ');
    let simpleName = [name[0]];
    for (let i = 1; i < name.length; i ++) {
      finder = true;
      for (let j = 0; j < name[i].length; j ++) {
        if (numbers.includes(name[i][j])) {
          finder = false;
          break;
        }
      }
      if (finder) simpleName.push(name[i]);
    }
    simpleName = simpleName.join(' ');
    if (totals.hasOwnProperty(simpleName)) {
      totals[simpleName] += Number(rowArr[debitCol])
    } else {
      totals[simpleName] = Number(rowArr[debitCol])
    }
  })
  // below code is to add the totals to a final output in alphabetical order
  let breakdown = [];
  for (let key in totals) {
    let newRow = `${key}, ${Number(totals[key].toFixed(2))}\n`;
    breakdown.push(newRow);
  }
  breakdown.sort((a,b) => {
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
  return "Establishment, $ Spent\n"+breakdown.join('')
}

