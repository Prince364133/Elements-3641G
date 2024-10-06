var pt = document.querySelector("#theTable")
var details = document.querySelector("#details")
var summary = document.querySelector("#summary")
var search = document.querySelector("#search")
var header = document.querySelector("#header")
var card = document.querySelector("#card")
var c1 = document.querySelector("#startColor")
var c2 = document.querySelector("#endColor")

var elementEls = [...pt.querySelectorAll(":scope > div:not([id='controls']):not([id='connector'])")];
const labelMap = {
  "cpk_hex": "CPK color",
  "category":"Series",
  "electron_configuration":"Electron config",
  "electronegativity_pauling":"Electronegativity",
  "ionization_energies":"Ionization (kJ/mol)",
  "phase":"Phase (0°C)"
}
const seriesColors = {
  "unknown":"#989898",
  "alkali metal":"hsl(48deg, 77%, 64%)",
  "alkaline earth metal":"hsl(60deg, 83%, 67%)",
  "lanthanide":"hsl(334deg, 76%, 86%)",
  "actinide":"#fce0ed",
  "transition metal":"hsl(10deg, 63%, 84%)",
  "metalloid":"hsl(165deg, 58%, 76%)",
  "polyatomic nonmetal":"hsl(120deg, 73%, 74%)",
  "diatomic nonmetal":"hsl(120deg, 73%, 74%)",
  "post-transition metal":"hsl(222deg, 62%, 80%)",
  "noble gas":"hsl(300deg, 74%, 82%)",
}
const superscripts = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'}
const unitsMap = {
  "atomic_mass":"amu",
  "Celsius":"°",
  "Fahrenheit":"°",
  "Kelvin": "K",
  "electron_affinity":"kJ/mol",
  "electronegativity_pauling":"kJ/mol",
  "ionization_energies":"kJ/mol",
  "radius":"pm",/*hardness*/
  "vickers":"MPa",
  "brinell":"MPa",
  "mohs":"MPa",
  "bulk":"GPa",/*modulus*/
  "shear":"GPa",
  "young":"GPa",
  "stp":"kg/m³",/*density*/
  "liquid":"kg/m³",
  "thermal":"W/mK",/*conductivity*/
  "electric":"MS/m",
  "specific":"J/kgK",/*heat*/
  "fusion":"kJ/mol",
  "vaporization":"kJ/mol",
  "molar":"J/K.mol",
  "universe":"%",/*abundance*/
  "solar":"%",
  "meteor":"%",
  "crust":"%",
  "human":"%",
  "calculated":"pm",/*radius*/
  "empirical":"pm",
  "covalent":"pm",
  "vanderwaals":"pm"
}
const colorMap = {
  "boil":{ "start": "#00ffee", "end": "#ff0000"},
  "melt":{ "start": "#00bfff", "end": "#ff0000"},
  "abundance":{ "start": "#8989ae", "end": "#ffae00"},
  "density":{ "start": "#ff00ff", "end": "#ffff00"},
  "atomic_mass":{ "start": "#e38ce3", "end": "#ffff00"},
  "discovered":{ "start": "#0f00ff", "end": "#f5efef"},
  "electron_affinity":{ "start": "#00fffff", "end": "#f3d720"},
  "electronegativity_pauling":{ "start": "#eccaec", "end": "#ff0240"},
  "hardness":{ "start": "#d9c4e4", "end": "#8b0ff5"},
  "heat":{ "start": "#0000ff", "end": "#ff0000"},
  "density":{ "start": "#8ad6ee", "end": "#ffff00"},
  "radius":{"start":"#e9f631", "end": "#000fff"},
  "conductivity":{"start":"#0ffff0", "end":"#891466"},
  "modulus":{"start":"#cbd194", "end":"#0000ff"}
}

/*fields either not displayed at all in the details section, or are instead displayed in the "element card"*/
var doNotDisplay = ["name", "symbol", "summary", "number", "xpos", "ypos", "electron_configuration_semantic",  "source"];
/*detail fields that are color-sortable*/
var clickableDetail = ["abundance", "atomic_mass", "boil", "conductivity", "density", "discovered", "electron_affinity", "electronegativity_pauling", "heat", "melt", "hardness", "modulus", "radius", "category", "cpk_hex" ]

/*ok, first, shape the data a bit by adding some calculated temps*/
pTable.forEach(el=>{
  el.boil && (el.boil = {
    "Celsius": (el.boil-273.15).toFixed(2),
    "Fahrenheit":((el.boil-273.15) * (9/5) + 32).toFixed(2),
    "Kelvin":el.boil
  })
  el.melt && (el.melt = {
    "Celsius": (el.melt-273.15).toFixed(2),
    "Fahrenheit":((el.melt-273.15) * (9/5) + 32).toFixed(2),
    "Kelvin":el.melt
  })
})

/*wire up element click "show details"*/
elementEls.forEach((el,i)=>{
  el.addEventListener("click", function(ev) { 

    elementEls.forEach(el=>el.classList.remove("active"))
    el.classList.add("active")
    let selected = details.querySelector(".selected")?.id
    
    summary.innerHTML = ""
    details.innerHTML = ""

    /*CARD*/
    let element = window.pTable.find(t=>t.name==el.children[2].innerText);
    let color = "#"+element.cpk_hex
    var neon = `text-shadow: 0 0 5px white, 0 0 10px ${color}, 0 0 15px ${color}, 0 0 20px ${color}`
    card.children[0].innerHTML = `<span>${element.number}</span>`
    card.children[1].innerHTML = `<span style="${neon}">${element.symbol}</span>`
    let catLabel = element.category.match(/unknown|.*/i)[0]
    card.children[2].innerHTML = `<span>${catLabel}</span>`
    card.children[2].style.color = seriesColors[catLabel];
    card.children[2].style.backgroundColor = seriesColors[catLabel];
    

    /*replace first occurence of name in the summary with the wiki link*/
    let findName = new RegExp(element.name, "i")
    let sum = element.summary.replace(findName, `<a target="_blank" href='${element.source}'>$&</a>`)
    card.children[3].innerHTML = `<span>${sum}</span>` 

    /*DETAILS*/    
    /*first, sort the fields not by their real name, but by their mapped label name if available*/
    let sortedFields = Object.keys(element).sort((a,b)=>{
      return (labelMap[a]||a).toLowerCase()>(labelMap[b]||b).toLowerCase() ? 1 : -1 
    })

    /*write the details*/
    sortedFields.forEach(key=> {   

      if(doNotDisplay.some(dont=>dont==key)) return;

      let span = document.createElement("div")
      span.id = key
      if(span.id==selected) span.classList.add("selected")
      let text = labelMap[key] || key
      text = capitalize(text)
      span.innerHTML= `<span>${text}:</span> <span>${printProp(key, element[key])}</span>`   
      details.appendChild(span)
      
      //change event for multi-data dropdowns (which is: color sort if already sorting on this category)
      span.querySelector("select")?.addEventListener("change", function(ev){
        let outerDiv = ev.target.parentNode.parentNode
        if(outerDiv.classList.contains("selected")){
          setColorByKey(outerDiv.id+"."+ev.target.value.match(/^\w+/)[0])
        }
      })
    })
    
    /*element details exist, now wire up details CLICK  (color sort)*/
    clickableDetail.forEach(cat=>{ /*cat=category, eg "hardness"*/
      let el = document.querySelector("#"+cat)
      if(el){
        el.classList.add("clickable");
        el.addEventListener('click', function(ev){
          
          clearBtn.click()
          if(ev.target.nodeName=="SELECT") return false;
          [...details.querySelectorAll(":scope div")].forEach(ell=>ell.classList.remove("selected"))
          el.classList.add("selected");
          if(el.id=="cpk_hex") { setColorByCPK(); return;}
          if(el.id=="category") { setColorBySeries(); return;}

          c1.value = colorMap[el.id].start
          c2.value = colorMap[el.id].end

          setColorByKey(getElementKey(el))         
        })
      }
    })

  })//end click function
})//end foreach elementEl

;[...document.querySelectorAll("#startColor, #endColor")].forEach(el=>{
  el.addEventListener("change", function(ev){
    let sel = details.querySelector(".selected")
    //if(!sel||sel.id=="cpk_hex"||sel.id=="category") return false;
    setColorByKey(getElementKey(sel))
  })
})


var searchFields = ["summary", "symbol", "name", "discovered", "discovered_by", "appearance", "category", "phase"]
function lessThan(x,y){ return x<y}
function equals(x,y){ return x==y}
function moreThan(x,y){ return x>y}

search.addEventListener("change", function(ev){

  let tokens = ev.target.value.split(" ")
  let matchedElements = pTable.filter(el=>{   
    let isMatch = true
    tokens.forEach(t=>{
      let reg = new RegExp("\\b"+t, "i")
      if(!searchFields.some(f=>reg.test(el[f]))){
        isMatch = false;
      }
    })
    return isMatch
  })
    elementEls.forEach(ell=>{
      ell.style.filter = "brightness(.4)"
    })
    matchedElements.forEach(m=>{
      let matched = elementEls.find(htm=>htm.id==m.symbol)
      matched.style.filter = "brightness(1)"
    })
})//end search change

/*clear button*/
document.querySelector("#clearBtn").addEventListener("click", function(ev){
  search.value = ""
  search.dispatchEvent(new Event('change'))
})

/*dark mode/light mode switch*/
document.querySelector("#lightMode").addEventListener("click", function(ev){
  if(ev.target.classList.contains("disabled")) {
     ev.target.classList.remove("disabled")
  } else {
     ev.target.classList.add("disabled")
  }
  let body = document.querySelector("body")
  if(body.classList.contains('light')) {
    body.classList.remove("light")
  } else {
    body.classList.add("light")
  }
})

/******************INIT***************/
//setColorByCPK()
elementEls[Math.floor(Math.random()*elementEls.length)].click()
details.querySelector("#cpk_hex")?.classList.add("selected")
document.querySelector("#card").style.display = "flex"
document.querySelector("#atomic_mass").click()
/****************END INIT************/

function setColorByKey(key) {
/*color code the chart by some numerical key (eg, boiling point)*/
  toggleColorInputs(true)
  /*determine the min and max values for this field (key), and then call setColorByRange*/
  let minElement = pTable.reduce((acc,cur)=>{
    let currentMin = valueAt(key,acc)
    let currentTarget = valueAt(key,cur)
    return !currentMin ? cur : (parseFloat(currentMin)>parseFloat(currentTarget) ? cur : acc)
  })
  let min = parseFloat(valueAt(key,minElement))
   
  let maxElement = pTable.reduce((acc,cur)=>{
    let currentMax = valueAt(key,acc)
    let currentTarget = valueAt(key,cur)
    return !currentMax ? cur : (parseFloat(currentMax)<parseFloat(currentTarget) ? cur : acc)
  })
  let max = parseFloat(valueAt(key,maxElement))
  
  /*with min and max in hand, color code the elements based on how far into that range their value is.*/
  elementEls.forEach((el,i)=>{
    let element = window.pTable.find(t=>t.name==el.children[2].innerText);
    
    /*set the "optional" 4th label (usually used for atomic weight) to be the value of the relevant sort field*/
    el.children[3].innerText = valueAt(key,element) || ""   
    
    el.style.backgroundColor = setColorByRange(el,parseFloat(valueAt(key,element)),min,max);
    [...el.querySelectorAll("span")].forEach(sp=>{
      sp.style.color = el.style.backgroundColor;
    }) 
  })
}

function setColorByRange(el, val, min, max) {
  /*called by setColorByKey to calculate colors between two values*/
  if(!val) return "#efefef"
  let color1 = hexToRGB(c1.value)
  let color2 = hexToRGB(c2.value)
  
  if(min<0){
    val = val + Math.abs(min)
  } else {
    val = val - min
  }
  let percent = val / (max-min)
  let red =  Math.floor(color1[0] + ((color2[0]-color1[0]) * (percent)))
  let green =  Math.floor(color1[1] + ((color2[1]-color1[1]) * (percent)))
  let blue =  Math.floor(color1[2] + ((color2[2]-color1[2]) * (percent)))

  color = `rgb(${red} ${green} ${blue})`
  el.style.backgroundColor = color
  el.style.color = el.style.backgroundColor;
  [...el.querySelectorAll("span")].forEach(sp=>{
    sp.style.color = el.style.backgroundColor
  })
  
}

function setColorBySeries() {
  toggleColorInputs(false)
  elementEls.forEach((el,i)=>{
    let element = window.pTable.find(t=>t.name==el.children[2].innerText);
    let key = element.category.match(/unknown|.*/i)[0];
    el.style.backgroundColor = seriesColors[key];
    el.style.color = el.style.backgroundColor;
    el.children[3].innerText = element.category.match(/unknown|\w+$/i)[0];
    [...el.querySelectorAll("span")].forEach(sp=>{
      sp.style.color = el.style.color
    })
  })
}

function setColorByCPK() {
  toggleColorInputs(false)
  elementEls.forEach((el,i)=>{
    let element = window.pTable.find(t=>t.name==el.children[2].innerText);
    el.style.backgroundColor = element.cpk_hex ? ("#"+element.cpk_hex) : "#efefef";
    el.children[3].innerText = parseFloat(element.atomic_mass.toFixed(4));  
    [...el.querySelectorAll("span")].forEach(sp=>{
      sp.style.color = el.style.backgroundColor;
      if(el.id=="In"||el.id=="W") sp.style.color = "black"/*some colors don't repsond well to the inversion/grayscale/contrast method let's just make those gray*/
    }) 
  })
}

function getElementKey(detailDiv) {
  /*get either simple key which is the div's id (eg "electron_affinity"), or if it contains <select>, get compound key eg "hardness.brickells" */
  let valueEl = detailDiv.children[1].children[0];
  if(valueEl.nodeName.toLowerCase()=="select"){
    let subKey = valueEl.value.match(/^[^:]+/)[0]
    return (detailDiv.id+"."+subKey)
  } else {
    return (detailDiv.id)
  }
}

function printProp(key,obj){
/*recursively call on obj types and build <selects> (a must to save space), otherwise, print the value*/
  if(typeof(obj)=="object"){
    let rez = ""
    let list = document.createElement("select")
    let keys = Object.keys(obj)
    keys.forEach((key,i)=>{
      rez += `<option>${key}: ${printProp(key,obj[key])}</option>`
    })
    list.innerHTML = rez
    return list.outerHTML
  } else {
    if(key=="electron_configuration") obj = superScript(obj)
    if(key=="cpk_hex") obj = "#"+obj
    return `<span>${isNumber(obj)?parseFloat(obj.toFixed(6)):obj}</span> <span class='units'>${unitsMap[key]||""}</span>`
  }
  
}

/*UTILITY*/
function superScript(electron_config) {
  //superscript trailing numbers in electron config string.
  let cf = electron_config 
  return cf.replace(/(?<=[a-z])(\d+)/g, function(m,g1) {
    let rep = ""
    g1.split("").forEach((ch)=>{
      rep+=superscripts[Object.keys(superscripts).indexOf(ch)]
    })
    return rep
  })
}
function capitalize(str){
  //also makes _underscores_ spaces
  return str.replace(/_/g, " ").replace(/^[a-z]/, (m)=>{
    return m.toUpperCase()
  })
}
function hexToRGB(hex){   
  return hex.match(/[A-Za-z0-9]{2}/g).map(function(component) { return parseInt(component, 16) })
} 
function valueAt(key, obj) {
  return key.split('.').reduce((p,c)=>p?.[c]||null, obj)
}
function isNumber(n){
  return Number(n)===n;
}
function toggleColorInputs(visible){
  document.querySelector("#colors").style.display = visible ? "block": "none";
}