const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//mongodb+srv://admin-akg:<password>@cluster0-thlpl.mongodb.net/test?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://admin-akg:Test123@cluster0-thlpl.mongodb.net/todolistDB",{useNewUrlParser:true, useUnifiedTopology:true});

const itemSchema={
  name:String
}

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({

  name:"welcome to your todolist"
})

const item2=new Item({

  name:"welcome to your list2"
})
const item3=new Item({

  name:"welcome to your todolist3"
})

const defaultItem=[item1,item2,item3];
const listSchema={
         name:String,
         items:[itemSchema]

};
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

Item.find({},function(err, foundItems){
  if(foundItems.length==0){

    Item.insertMany(defaultItem,function(err){
      if(err){
        console.log(err);
        }
   else{
     console.log("succesfully done! bye bye");
     }
     
});
res.redirect("/");
}else{
res.render("list", {listTitle: "Today", newListItems: foundItems});
}

});


});


app.get("/:customListName", function(req,res){

  const customListName=_.capitalize(req.params.customListName);
List.findOne({name:customListName},function(err,foundlist){
   if(!err){
     if(!foundlist){
      const list =new List({
        name:customListName,
        items:defaultItem
      })
       list.save();
       res.redirect("/" + customListName); 
                }
       else{ res.render("list",{listTitle: foundlist.name, newListItems: foundlist.items})
         }
     }
});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
      name:itemName
  });
  if(listName=="Today"){
  item.save();
  res.redirect("/");}
  else{
    List.findOne({name:listName},function(err,foundlist){
       foundlist.items.push(item);
       foundlist.save();
       res.redirect("/" + listName);
    });
  }
});
app.post("/delete",function(req,res){

const checkedItemId = req.body.checkbox;
const listName=req.body.listName;

if(listName=="Today"){


  Item.findByIdAndDelete(checkedItemId, function(err,data) { 

    if(!err){console.log("succesfully deleted checked item");
               res.redirect("/");}
    
    });

}

else{
   List.findOneAndUpdate({name:listName},{$pull:{items: {_id:checkedItemId}}},function(err,foundlist){

    if(!err){
      res.redirect("/" + listName);
    }
   });
}

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
