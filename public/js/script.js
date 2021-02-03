Vue.component("comment-component", {
    props: ["id"],
    data: function () {
      return {
        username: "",
        comments: null,
        comment: "",
      };
    },
    mounted: function () {
      console.log("mounting comment component", this.id);
      var self = this;
      axios.get("/comments/" + self.id).then((res) => {
          console.log("Das ist res", res.data);
          comments = res.data;
          self.comments = comments;
          console.log("Res of comments", comments); 
      });
    },
    methods: {
      submitComment: function () {
        var self = this;
        axios.post("/comments/", {
          imageId: self.id,
          comment: self.comment,
          username: self.username
        }).then((res) => {
          var newComment = res.data.rows[0];
          self.comments.unshift(newComment);
        });
      },
    },
    template: "#comment-template",
  });
  
  Vue.component("lightbox-component", {
    props: ["id"],
    data: function () {
      return {
        title: "",
        url: "",
        desc: "",
        username: "",
        comments: null,
      };
    },
    mounted: function () {
      var self = this;
      console.log(this.id);
      axios.get("/images/" + this.id).then((res) => {
          console.log("res data images", res.data);
        //let lastId = res.data.rows[0].lastid;
        //self.lastId = lastId;
        self.title = res.data.title;
        self.url = res.data.url;
        self.desc = res.data.description;
        self.username = res.data.username;
        console.log("res data title", res.data.title);
      });
    },
    template: "#lightbox-template",
  });
  
  new Vue({
    el: "#main",
    data: {
      greeting: "SHARING WITHOUT CARING!",
      name: "",
      title: "",
      desc: "",
      username: "",
      filename: "",
      url: "",
      file: null,
      images: null,
      clickedImageId: null,
      lastId: null,
      lastIdImageRow: null,
      buttonOn: true,
      newImageRow:null
    },
    created: function () {
      console.log("created");
    },
    mounted: function () {
      console.log("mounted");
      var self = this;
      axios.get("/images").then((res) => {
        var images = res.data.rows;
        console.log("images", images);
        self.images = images;
      });
    },
    updated: function () {
      console.log("updated");
    },
    methods: {
      submit: function () {
        console.log(this.title, this.file);
        var self = this;
        var fd = new FormData();
        fd.append("title", this.title);
        fd.append("desc", this.desc);
        fd.append("username", this.username);
        fd.append("file", this.file);
        axios.post("/upload", fd).then((res) => {
          var newImage = res.data.rows[0];
          self.images.unshift(newImage);
        });
      },
      loadmore: function () {
        let id = this.images[this.images.length-1].id
        let self = this;
        self.lastIdImageRow = id;
        console.log(id);
        axios.get("/loadImages/" + id).then(res => {
            var newImageRow = res.data.rows;
            console.log("New Image Row", newImageRow);
            newImageRow.forEach(item => {
                self.images.push(item);
            });
            if(newImageRow.length < 12) {
                self.buttonOn = false;
            }
        }); 
         
      },
      selectedFile: function (e) {
        console.log(e.target.files[0]);
        this.file = e.target.files[0];
      },
    },
  });