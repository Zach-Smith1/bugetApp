import fs from 'fs';

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
    // if there's a credit change it to a negative debit
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
    console.log('Final CSV', finalCsv)
    return finalCsv
  }
  for (let name in totals) {
    // round totals to next highest cent
    let rows = `${name}, ${Math.ceil(totals[name]*100)/100}\n`;
    // store as csv formatted string
    finalCsv += rows;
  }
  console.log('Final CSV by Category: ', finalCsv)
  //return totals as csv with header added and as an object (to use keys for category selector wheel)
  return ["Category, $ Spent\n"+finalCsv,totals]
}

export function fineGrainedBreakdown(file) {
  console.log(`fineGrainedBreakdown is parsing ${file} spreadsheet file...`);

  // const dataString = fs.readFileSync(file, "utf8");
  // split raw data into rows
  let allRows = file.split('\n')
  let headerRow = 0;
  const columnNames = allRows[headerRow].split(',');
  // omit column names from array of rows
  allRows = allRows.slice(headerRow + 1);
  // create output string for this function to return
  const totals = {};

  // iterate through the rows and add them to the new object only if the item has an NDC
  let descriptionCol = 0;
  while (columnNames[descriptionCol] !== 'Description') {
    descriptionCol ++
  }
  let debitCol = 0;
  while (columnNames[debitCol] !== 'Debit') {
    debitCol ++
  }
  allRows.forEach((row) => {
    let rowArr = row.split(',');
    if (rowArr[descriptionCol] === undefined) return
    let name = rowArr[descriptionCol];
    // edge cases to combine different store locations
    if (name.slice(0,6) === 'WAL-MA' || name.slice(0,6) === 'WM SUP') {
      name = 'WAL-MART'
    }
    if (name.slice(0,6) === 'WINN D') {
      name = 'WINN DIXIE'
    }
    if (name.slice(0,9) === 'AMZN Mktp' || name.slice(0,6) === 'AMAZON') {
      name = 'AMAZON '
    }
    if (name.slice(0,12) === 'Amazon Prime') {
      name = 'AMAZON '
    }
    if (name.slice(0,6) === 'PANERA') {
      name = 'PANERA '
    }
    if (name.slice(0,8).toLowerCase() === 'mcdonald') {
      name = 'MCDONALDS '
    }
    if (name.slice(0,6) === 'GOOGLE') {
      name = 'GOOGLE '
    }


    if (totals.hasOwnProperty(name)) {
      totals[name] += Number(rowArr[debitCol])
    } else {
      totals[name] = Number(rowArr[debitCol])
    }
  })
  console.log(`\nTotals Aggregated from ${file.slice(0, -4).toUpperCase()}\n`)
  // console.log(totals)
  let breakdown = '';
  for (let name in totals) {
    breakdown += `${name}, ${Math.ceil(totals[name]*100)/100}\n`;
  }
  return "Establishment, $ Spent\n"+breakdown
}

