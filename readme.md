  document.querySelector("#editbtn").addEventListener("change",function()
    {
      document.querySelector("#fileform").submit();
    })

<form id="fileform" hidden action="/update" enctype="multipart/form-data" method="post">
  <input id="imageinput" hidden type="file" name="image">
</form> 

   document.querySelector("#file").addEventListener("change",function()
    {
      document.querySelector("#fileform").submit();
    })