const checkpoint = 100;
 
window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll <= checkpoint) {
    opacity = 1 - currentScroll / checkpoint;
  } else {
    opacity = 0;
  }
  document.getElementById("down").style.opacity = opacity;
});

// Now for navigation
function showContent(e, contentID) {
  var i, content, tabs;

  // Hide everything
  content = document.getElementsByClassName("tabContent");
  for(i = 0; i < content.length; i++) {
    content[i].style.display = "none";
  }

  // Show the tab
  document.getElementById(contentID).style.display = "block";
}

// Show a tab by default
document.getElementById("default").click();