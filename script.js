// **************
// ** HOMEPAGE **
// **************

// Get data to display on homepage
$(document).ready(function(){
  $.ajax({
    type: 'GET',
    url: "http://exercise.wandome.com/page/init?token="+getToken(),
    success: function(data){
      renderHeader(data["data"]["lang"]["topbar"]);
      renderCompanyName(data["data"]["company_name"])
      renderFooter(data["data"]["lang"]["footer"]);
      if(window.location.search){
        searchGetRequest(window.location.search.substr(1)); //remove additional ? char
      }
    }
  });
});

function renderCompanyName(companyName){
  var version = document.getElementById("company-name");
  version.innerHTML = companyName;
}

function renderHeader(data){
  var header = "<table>";
  for (var key in data){

      // SEARCH TRANSLATIONS
      if(key == "search_button"){
        $('#search_button').attr('value', data[key]);
        continue;
      }
      if (key == "search_placeholder"){
        $('#search_placeholder').attr('placeholder', data[key]);
        continue;
      }
      if (key == "search_input"){
        var thing = document.getElementById('search_input');
        thing.innerHTML = data[key];
        continue;
      }
      // END OF SEARCH TRANSLATIONS
      header = header + "<td><a href='#'>" + data[key] + "</a></td>";
    }
  header = header + "</table>";
  var version = document.getElementById("header");
  version.innerHTML = header;
}

function renderFooter(data){
  var footer = "<table>";
  for (var key in data){
    footer = footer + "<td><a href='#'>" + data[key] + "</a></td>";
  }
  footer = footer + "</table>";
  var version = document.getElementById("footer");
  version.innerHTML = footer;
}

// **************
// *** SEARCH ***
// **************

// Sumbit handler for search box
$( "#search" ).submit(function( event ) {

  var searchTerm = $(this).serialize();
  if (searchTerm == "keyword=") return; // equv to null
  searchGetRequest(searchTerm);
  //event.preventDefault();
});

// To construct suitable url for search
function searchGetRequest(searchTerms){
  $(function(){
    $.ajax({
      type: 'GET',
      url: "http://exercise.wandome.com/offer/list?" + searchTerms + "&token=" + getToken(),
      success: function(data){
        // list of offers + pagination data
        if(data["data"]["paginate"]["total_no"] != 0){
          displayOffers(data["data"]["offers"]["list"], data["data"]["paginate"], data["data"]["lang"]["product"]);
        } else {
          var version = document.getElementById("content");
          version.innerHTML = "<p>" + data["data"]["lang"]["no_result"]["header"].replace(":keyword", jQuery.query.get("keyword")) + "</p>";
        }

      }
    });
  });
}

function displayOffers(offers, pagination, product_translation){
  var keyword = '<h2>"' + jQuery.query.get("keyword") + '"</h2>';
  var offersTable = "<table id='searchResultsTable'><tr>";
  // using this variable to add rows so max 6 columns will be rendered
  var i = 0;
  for(var key in offers){
    if(i == 6){
      offersTable = offersTable + "</tr><tr>" // done here ^
      i = 0;
    }
    // construct individual td element including link, price, and photo
    offersTable = offersTable + "<td>"+"<a href=" + makeUrl(offers[key]["redirect_url"])
    +"><img class='thumb' src="
    +offers[key]["photo"]["thumb_url"]
    +"/><br/>"+offers[key]["title"]
    +"<br/><br/><p class='price'>"+offers[key]["price"]
    +"</p><p class='shipping_price'>" + (getShippingPrice(offers[key]["shipping_price"]) ? product_translation["shipping_costs"] + ": " + offers[key]["shipping_price"] : product_translation["free_shipping"])
    +"</p></a></td>";
    i = i + 1;
  }
  offersTable = offersTable + "</tr></table>";
  // pagination
  offersTable = offersTable + getPaginationMenu(pagination);
  // render in HTML
  var version = document.getElementById("content");
  version.innerHTML = keyword + offersTable;
}

function makeUrl(path){
  // NEED TO FIND OUT CORRECT URL CONSTRUCTION
  //return "http://exercise.wandome.com/offer/list" + window.location.search + path;
  return "http://products-i-want.co.uk" + path;
}

function getPaginationMenu(pagination){
  // create menu options based on current page
  var menu = [];
  // for items with fewer results, we need the menu to display fewer page options
  if (pagination["page"] <= 3){
    // we round up as we need to display the final few items
    var numOfPages = 0 + Math.ceil((pagination["total_no"])/(pagination["per_page"]));
    for (var i = 1; i <= numOfPages; i++){
      // max of 5 pages visible on menu to keep it simple
      if(i > 5){
        break;
      }
      menu.push(i);
    }
  } else if ((pagination["page"]) >= (pagination["last_page"] - 2)){
    menu = [pagination["last_page"]-4, pagination["last_page"]-3, pagination["last_page"]-2, pagination["last_page"]-1, pagination["last_page"]];
  } else {
    menu = [pagination["page"]-2, pagination["page"]-1, pagination["page"], pagination["page"]+1, pagination["page"]+2]
  }
  // design button links
  // opening tags
  var pagMenu = "<nav aria-label='Page navigation' id='page_nav'> <ul class='pagination'>";

  // include previous button if not on first page
  if (pagination["page"] >= 2){
    pagMenu = pagMenu + "<li> <a href=javascript:goToPage(1) aria-label='Previous'> <span aria-hidden='true'><u>&laquo;</u></span> </a> </li><li> <a href=javascript:goToPage("+ (pagination["page"]-1) +") aria-label='Previous'> <span aria-hidden='true'>&laquo;</span> </a> </li>";
  }

  // generate each button
  for (var i = 0; i < menu.length; i++){
    if (menu[i] == jQuery.query.get("page")){
      pagMenu = pagMenu + "<li class='active'>";
    } else {
      pagMenu = pagMenu + "<li>";
    }
    pagMenu = pagMenu + "<a href=javascript:goToPage("+ menu[i] +")>" + menu[i] + "</a></li>";
  }

  // include next button if not on first page
  if (pagination["page"] != pagination["last_page"]){
    pagMenu = pagMenu + "<li> <a href=javascript:goToPage("+ (pagination["page"]+1) +") aria-label='Next'> <span aria-hidden='true'>&raquo;</span> </a> </li><li> <a href=javascript:goToPage("+ pagination["last_page"] +") aria-label='Next'> <span aria-hidden='true'><u>&raquo;</u></span> </a> </li>";
  }

  //closing tags
  pagMenu = pagMenu + "</ul> </nav>";

  return pagMenu;
}

function goToPage(pageNo){
  var new_query = "" + jQuery.query.set("page", pageNo);
  window.location.href = new_query;
}

function getShippingPrice(shipping_price){
  if (shipping_price == null || Number(shipping_price.replace(/[^0-9\.]+/g,"") == 0)){
    return false;
  } else {
    return true;
  }
}

// **************
// *** OTHER ****
// **************


function getToken() {
  return "1234567890abcd.12345678";
}
