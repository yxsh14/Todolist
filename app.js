const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const app=express();
const _= require("lodash");
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect(`mongodb+srv://Yash:Yash1234@cluster0.yahz0.mongodb.net/?retryWrites=true&w=majority`, {useNewUrlParser:true});

// CREATING A SCHEMA OF ITEMS
const itemSchema=new mongoose.Schema({
  name: String
});
const Item= mongoose.model("Item",itemSchema);
// item1
const item1=new Item({
  name:"Welcome in your todolist!"
});
// item2
const item2=new Item({
  name:"<Hit the + button to add a new item."
});
// item3
const item3=new Item({
  name:"Hit this delete button to delete item."
});
const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/",function(req, res){
  // Getting date and displaying it.;
  let today=new Date();
  let options={day: 'numeric',weekday:'long', month:'long'};
  let day=today.toLocaleDateString("en-US",options);
  Item.find({},function(err,foundItems){
    if (foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if (err){
          console.log(err);
        }
        else{
          console.log("Successfully saved item to database.");
        }
      });
      return res.redirect("/");
    }
    else{
      return res.render('list', {listTitle:"Today", newListItems:foundItems});
    }
  });

});

app.get("/:customList",function(req,res){
const customList=_.capitalize(req.params.customList);
  List.findOne({name:customList},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name: customList,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customList);
      }else{
        res.render("list", {listTitle:foundList.name, newListItems:foundList.items})
      }
    }
  });




});


app.post("/",function(req, res){
  const itemName=req.body.item;
  const listname=req.body.listTitle;
const item =new Item({
      name:itemName
    });
    if(listname==="Today"){
      item.save();
      res.redirect("/");
    }else {
      List.findOne({name: listname},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listname);
      })
    }
  });
// DELETING A PARTICULAR ELEMENT
app.post("/delete",function(req,res){
  const checkboxId=req.body.checkbox;
  const listname=req.body.listname;
  if(listname==="Today"){
    Item.deleteOne({_id:checkboxId},function(err){
      if(!err){
        console.log("We Successfully Deleted this element.");
        res.redirect("/");
  }
});
}else{
      List.findOneAndUpdate({name:listname},{$pull: {items:{_id:checkboxId}}},function(err,foundList){
        if (!err){
          res.redirect("/"+listname);
        }
      });
  }

});

// ABOUT
app.get("/about",function(req, res){
  return res.render("about");
})
// CHECKING WEATHER THE SERVER IS RUNNING OR NOT.
let port= process.env.PORT;
if (port==null || port=="") {
  port=8000;
}

app.listen(port, function(){
  console.log("The server started Successfully on port 8000");
})
