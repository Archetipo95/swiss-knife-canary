import{j as s}from"./jsx-runtime-u17CrQMm.js";const a=({title:t})=>s.jsxs("article",{style:{border:"1px solid #cbd5e1",padding:16,font:"16px sans-serif",color:"#0f172a"},children:[s.jsx("h2",{style:{margin:0,fontSize:20},children:t}),s.jsx("p",{children:"Rendered at the story's own viewport."})]}),n={title:"Fixture/Card",component:a},e={args:{title:"Mobile card"},globals:{viewport:{value:"mobile1",isRotated:!1}}},r={args:{title:"Not compared"},parameters:{swissKnife:{visual:{skip:!0}}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Mobile card'
  },
  globals: {
    viewport: {
      value: 'mobile1',
      isRotated: false
    }
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Not compared'
  },
  parameters: {
    swissKnife: {
      visual: {
        skip: true
      }
    }
  }
}`,...r.parameters?.docs?.source}}};const i=["Mobile","OptedOut"];export{e as Mobile,r as OptedOut,i as __namedExportsOrder,n as default};
