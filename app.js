// BUDGET CONTROLLER
var budgetController = (function () {

  var Expense = function (id, description, value) {
    this.id = id,
      this.description = description,
      this.value = value,
      this.percentage = -1
  }

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100)
    } else {
      this.percentage = -1
    }
  }

  Expense.prototype.getPercentage = function () {
    return this.percentage
  }

  var Income = function (id, description, value) {
    this.id = id,
      this.description = description,
      this.value = value
  }

  var calculateTotal = function (type) {
    var sum = 0;

    data.allItems[type].forEach(function (cur) {
      sum += cur.value
    })

    data.totals[type] = sum
  }

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  }

  return {
    addItem: function (type, des, val) {
      var newItem, ID

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1
      } else {
        ID = 0
      }

      // Create new item based on 'inc' oc 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val)
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val)
      }

      // Push it into our data structure
      data.allItems[type].push(newItem)

      // Return the new element
      return newItem
    },

    deleteItem: function (type, id) {
      var ids, index

      ids = data.allItems[type].map(function (current) {
        return current.id
      })

      index = ids.indexOf(id)

      if (index !== -1) {
        data.allItems[type].splice(index, 1)
      }
    },

    calculateBudget: function () {
      // Calculate total income and expenses
      calculateTotal('exp')
      calculateTotal('inc')

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp

      // Calculate the percentage of income that we spent
      if (data.totals.inc > 0) {

        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc)
      })
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage()
      })

      return allPerc
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: function () {
      console.log(data)
    }
  }

})()



// UI CONTROLLER
var UIController = (function () {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incommeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage'
  }

  var formatNumber = function (num, type) {
    var numSplit, int, dec, type
    /*
    + or - before number
    exactly 2 decimal points
    comma separating the thousands
    */

    num = Math.abs(num)
    num = num.toFixed(2)

    numSplit = num.split('.')

    int = numSplit[0]

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
    }

    dec = numSplit[1]

    return (type === 'exp' ? '-' : '+') +
      ' ' + int + '.' + dec
  }

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    },

    addListItem: function (obj, type) {
      var html, element, svgIcon

      var svgIcon = function (color) {
        return (
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="20px" height="20px" fill="${color}">
            <path style="line-height:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000;text-transform:none;block-progression:tb;isolation:auto;mix-blend-mode:normal" d="M 25 3 C 12.86158 3 3 12.86158 3 25 C 3 37.13842 12.86158 47 25 47 C 37.13842 47 47 37.13842 47 25 C 47 12.86158 37.13842 3 25 3 z M 25 5 C 36.05754 5 45 13.94246 45 25 C 45 36.05754 36.05754 45 25 45 C 13.94246 45 5 36.05754 5 25 C 5 13.94246 13.94246 5 25 5 z M 16.990234 15.990234 A 1.0001 1.0001 0 0 0 16.292969 17.707031 L 23.585938 25 L 16.292969 32.292969 A 1.0001 1.0001 0 1 0 17.707031 33.707031 L 25 26.414062 L 32.292969 33.707031 A 1.0001 1.0001 0 1 0 33.707031 32.292969 L 26.414062 25 L 33.707031 17.707031 A 1.0001 1.0001 0 0 0 32.980469 15.990234 A 1.0001 1.0001 0 0 0 32.292969 16.292969 L 25 23.585938 L 17.707031 16.292969 A 1.0001 1.0001 0 0 0 16.990234 15.990234 z" font-weight="400" font-family="sans-serif" white-space="normal" overflow="visible"/>
          </svg>`
        )
      }

      // Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer

        html = `<div class="item clearfix" id="inc-${obj.id}">
          <div class="item__description">${obj.description}</div>
          <div class="right clearfix">
            <div class="item__value">${formatNumber(obj.value, type)}</div>
            <div class="item__delete">
              <button class="item__delete--btn">${svgIcon('#28B9B5')}</button>
            </div>
          </div>
        </div>`
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer

        html = `<div class="item clearfix" id="exp-${obj.id}">
          <div class="item__description">${obj.description}</div>
          <div class="right clearfix">
            <div class="item__value">${formatNumber(obj.value, type)}</div>
            <div class="item__percentage">%</div>
            <div class="item__delete">
              <button class="item__delete--btn">${svgIcon('#FF5049')}</button>
            </div>
          </div>
        </div>`
      }

      // Replace the placeholder text with some actual data

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', html)
    },

    deleteListItem: function (selectorID) {
      var el
      el = document.getElementById(selectorID)
      document.getElementById(selectorID).parentNode.removeChild(el)
    },

    clearFields: function () {
      var fields, fieldsArr
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)

      fieldsArr = Array.prototype.slice.call(fields)

      fieldsArr.forEach(function (current, index, fields) {
        current.value = ''
      })

      fieldsArr[0].focus()
    },

    displayBudget: function (obj) {
      var type

      obj.budget > 0 ? type = 'inc' : type = 'exp'
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type)
      document.querySelector(DOMstrings.incommeLabel).textContent = formatNumber(obj.totalInc, 'inc')
      document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp')

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---'
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel)

      var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i)
        }
      }

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%'
        } else {
          current.textContent = '---'
        }
      })
    },

    getDOMstrings: function () {
      return DOMstrings
    }
  }

})()



// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {


  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMstrings()
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem()
      }
    })

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
  }

  var updateBudget = function () {
    // 1. Calculate the budget on the UI
    budgetCtrl.calculateBudget()

    // 2. Return the budget
    var budget = budgetCtrl.getBudget()

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget)
  }

  var updatePercentages = function () {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages()

    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages()

    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages)
  }

  var ctrlAddItem = function () {
    var input, newItem

    // 1. Get the field input data
    input = UICtrl.getInput()

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value)

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type)

      // 4. Clear the fields
      UICtrl.clearFields()

      // 5. Caclulate and update budget
      updateBudget()

      // 6. Caclulate and update percentages
      updatePercentages()
    }
  }

  var ctrlDeleteItem = function (event) {
    var itemID, splitTD, type, ID

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

    if (itemID) {
      splitTD = itemID.split('-')
      type = splitTD[0]
      ID = parseInt(splitTD[1])

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID)

      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID)

      // 3. Update and show the new budget
      updateBudget()

      // 4. Caclulate and update percentages
      updatePercentages()
    }
  }

  return {
    init: function () {
      console.log('App has started.')
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      })
      setupEventListeners()
    }
  }

})(budgetController, UIController)


controller.init()
