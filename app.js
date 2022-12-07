require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//mongoose.connect("mongodb://0.0.0.0:27017/BlogPostDB");
const databasePass = process.env.PASSWORD;
mongoose.connect("mongodb+srv://admin-arbi:"+ databasePass +"@cluster0.bba81.mongodb.net/BlogPostDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({
    name: "Add any task here!"
});


// another page
const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List" , listSchema);



app.get("/", function(req, res) {

  Item.find(function(err , items){
    if (items.length === 0){
      Item.create({name: item1.name}, function(err){
        if (err){
          console.log(err);
        }
        else{
          console.log("Added the default item to the database!");
        }
      });
      res.redirect("/");
    }
    else if (err){
      console.log(err);
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName} , function(err , foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});


app.post("/delete" , function(req , res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItem , function(err){ // needs the callback to be executed
      if (err){
        console.log(err);
      }
      else{
        console.log("Succefully deleted the checked item from the " + listName + "'s list !");
      }
    })
    res.redirect("/");
  }
  else{
      List.findOneAndUpdate({name: listName} , {$pull: {items: {_id: checkedItem}}} , function(err){
        if (!err){
          res.redirect("/" + listName);
        }
      });
  }

})


app.get("/:customListName" , function(req , res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName} , function(err , foundList){
      if (!err){
        if (!foundList){
          // create a new list
          const list = new List({
            name : customListName,
            items : [{name: item1.name}]
          })

          list.save();
          res.redirect("/" + customListName);
        }
        else{
          // show an existing list
          if (foundList.items.length === 0){
            foundList.items.push(item1);
          }
          res.render("list" , {listTitle: foundList.name, newListItems: foundList.items})
        }
      }
    })

})


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started Succefully");
});
