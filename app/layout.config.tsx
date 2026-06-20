import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const baseOptions: BaseLayoutProps = {
  disableThemeSwitch: true,
  nav: {
    transparentMode: 'top',
    title: (
      <>
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="mx-auto w-6 h-6 mb-2" 
        />
        <span className="font-medium [.uwu_&]:hidden [header_&]:text-[15px]">
        ArcartX Doc
        </span>
      </>
    ),
    // logo 点击直达主页（多项目入口），不再走 /docs 索引页
    url: '/',
  },
  links: [
    {
      text: '主页',
      url: '/',
      active: 'url',
    },
    {
      text: '社区',
      url: 'https://arcartx.com/',
      active: 'nested-url',
    },
    {
      text: 'QQ群',
      url: 'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=bq2Egfr376H6Tp_2KCfcbDzI2IRndERq&authKey=ffKd3oo4B9GOUjt70TDo7J9Z2NTcGVz5CiTigJEPwA%2FUX0CLSO9ZM%2FVvPi8hLtfo&noverify=0&group_code=832063293',
      active: 'nested-url',
    },
    {
      text: '爱发电',
      url: 'https://afdian.com/a/arcartx/',
      active: 'nested-url',
    },
  ],
};





