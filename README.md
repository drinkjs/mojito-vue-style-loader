# shadow-style-loader

## Options

- **Webpack** (5.0+):

  ``` js
  {
    test: /\.css$/i,
    use: [
      {
        loader: "shadow-style-loader",
        options: {
          flag: "app1",
          event: "custom style loader event"
        }
      },
      {
        loader: "css-loader",
        options: { importLoaders: 1 },
      },
    ]
  },
  ```
- **Page**
  ``` js
    import { addStyles } from "shadow-style-loader/lib/addStylesShadow";

    document.addEventListener("custom style loader event", (e)=>{
      if(e.detail.flag === "app1"){
        const shadowRoot = document.getElementById("add style element").attachShadow({ mode: "open" });
        addStyles(e.detail.style, shadowRoot);
        
      }else if(e.detail.flag === "app2"){
        ...
      }
    });
  ```

## License

MIT
