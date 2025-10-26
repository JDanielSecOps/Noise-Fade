
import "./styles/app.css"
import Header from '@/components/header/header'
import Footer from '@/components/footer/footer'
import FileSubmit from "./components/file_submit/file-submit"



function App() {

  return (
    <>
    <Header/>
    <div className="submit-container">
      <FileSubmit style="submit"/>
    </div>
    <Footer style="footer"/>     
    </>
  )
}

export default App
