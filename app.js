//jshint esversion:6

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const date = require(__dirname + '/date.js')
const app = express()
const _ = require('lodash')
let day = date.getDate()


app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static('public'))

mongoose.connect('mongodb+srv://admin-ethan:test123@cluster0.vpxdd.mongodb.net/todolistDB?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

const itemSchema = {
  name: String
}

const Item = mongoose.model('Item', itemSchema)

const listSchema = {
  name: String,
  list: [itemSchema]
}

const List = mongoose.model('List', listSchema)

const defaultItem1 = new Item({
  name: 'Welcome to your ToDo List'
})
const defaultItem2 = new Item({
  name: 'Click the + to add an item'
})
const defaultItem3 = new Item({
  name: '<=Click checkbox to delete'
})

const defaultItems = [defaultItem1, defaultItem2, defaultItem3]

app.get('/favicon.ico', (req, res) => res.status(204).end)

app.get('/', (req, res) => {
  List.findOne({name: 'Today'}, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //Create new list
        const newList = new List({
          name: 'Today',
          list: defaultItems
        })
        newList.save(() => {
          res.redirect('/')
        })
      } else {
        //Render existing list
        res.render('list', {
          listTitle: foundList.name,
          newListItems: foundList.list,
          listDate: day
        })
      }
    }
  })
})

app.get('/:listName', (req, res) => {
  const listName = _.capitalize(req.params.listName)

  List.findOne({name: listName}, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //Create new list
        const newList = new List({
          name: listName,
          list: defaultItems
        })
        newList.save(() => {
          res.redirect('/' + listName)
        })
      } else {
        //Render existing list
        res.render('list', {
          listTitle: foundList.name,
          newListItems: foundList.list,
          listDate: day
        })
      }
    }
  })
})

app.post('/', (req, res) => {
  const listName = req.body.list
  const listItem = req.body.newItem

  const item = new Item({
    name: listItem
  })

  List.updateOne({name: listName}, {$push: {list: item}}, (err) => {
    if (!err) {
      if (listName === 'Today') {
        res.redirect('/')
      } else {
        res.redirect('/' + listName)
      }
    }
  })
})

app.post('/delete', (req, res) => {
  const listName = req.body.list
  const checkedItemId = req.body.checkbox

  List.findOneAndUpdate({name: listName}, {$pull: {list: {_id: checkedItemId}}}, (err) => {
    if (!err) {
      if (listName === 'Today') {
        res.redirect('/')
      } else {
        res.redirect('/' + listName)
      }
    }
  })
})

let port = process.env.PORT
if (port == null || port == '') {
  port = 8000
}

app.listen(port, () => {
  console.log('Server has started successfully.')
})
