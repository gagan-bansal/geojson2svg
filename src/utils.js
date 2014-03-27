module.exports = {
  calResolution: function(extent,size) {
    var xres = (extent[2] - extent[0])/size.width;
    var yres = (extent[3] - extent[1])/size.height;
    return Math.max(xres,yres);
  }
};
