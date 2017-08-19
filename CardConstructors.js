const fs = require("fs");

var funcs = {
    BasicCard: function BasicCard(front, back, packs){
        var newCard = 
            {
                front: front,
                back: back,
                packs: packs,
                type: "flash"
            };
        
        var data = JSON.parse(fs.readFileSync('cards.json', 'utf8'));    
        data.cards.flash.push(newCard);
        fs.writeFileSync("cards.json", JSON.stringify(data), "utf8");   
    },
    ClozeCard: function ClozeCard(text, deletion, packs){
        var newCard = 
            {
                text: text,
                deletion: deletion,
                packs: packs,
                type: "cloze"
            };
        var data = JSON.parse(fs.readFileSync('cards.json', 'utf8'));    
        data.cards.cloze.push(newCard);
        fs.writeFileSync("cards.json", JSON.stringify(data), "utf8"); 
    }
}

module.exports = funcs;

