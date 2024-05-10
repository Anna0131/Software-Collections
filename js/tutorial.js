function setIframeHeight() {
    const iframe_height = window.screen.height + 300;
    document.getElementsByTagName("iframe")[0].style.height = iframe_height + "px";
}

setIframeHeight();
