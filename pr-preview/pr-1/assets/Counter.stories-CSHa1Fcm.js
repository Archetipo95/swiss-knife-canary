import{j as o}from"./jsx-runtime-u17CrQMm.js";import{r}from"./iframe-Bt9AqYb7.js";import"./preload-helper-PPVm8Dsz.js";const s=()=>{const[n,t]=r.useState(0);return o.jsxs("div",{style:{font:"16px sans-serif",color:"#0f172a"},children:[o.jsxs("p",{children:["Count: ",n]}),o.jsx("button",{type:"button",onClick:()=>t(a=>a+1),children:"Increment"})]})};s.__docgenInfo={description:"",methods:[],displayName:"Counter"};const{expect:c,userEvent:i,within:m}=__STORYBOOK_MODULE_TEST__,d={title:"Fixture/Counter",component:s},e={play:async({canvasElement:n})=>{const t=m(n);await i.click(t.getByRole("button",{name:"Increment"})),await c(t.getByText("Count: 2")).toBeVisible()}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Increment'
    }));
    await expect(canvas.getByText('Count: 2')).toBeVisible();
  }
}`,...e.parameters?.docs?.source}}};const x=["InteractionIncrement"];export{e as InteractionIncrement,x as __namedExportsOrder,d as default};
