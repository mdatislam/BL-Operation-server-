// const corsOptions = {
//     origin: 'https://bloperation.com', // Allow requests from this origin
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true, // Allow sending cookies and HTTP Basic Authentication
//     optionsSuccessStatus: 204, // Respond with a 204 status code if CORS preflight is successful
//   };
  
//   app.use(cors(corsOptions)); 
  
  //https://enigmatic-eyrie-94440.herokuapp.com
  // http://localhost:5000
  //https://backend.bloperation.com/
  //https://blserver.bloperation.com/
  
  //.htaccess file
  /* IfModule mod_rewrite.c>
  
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-l
    RewriteRule . /index.html [L]
  
  </IfModule> */
  
  //https://bl-operation-server-production.up.railway.app
  // npm install react-csv --save
  

  /*  To delete the issue */
//   const handleDelete=id=>{
//     //console.log(id)
//     if(id){
//         Swal.fire({
//             title: 'Are you sure?',
//             text: "You won't be able to revert this!",
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, delete it!'
//           }).then((result) => {
//             if (result.isConfirmed) {
//                 axiosSecure.delete(`/siteIssues/${id}`)
//                 .then(deleteRes=>{
//                     if(deleteRes.data.deletedCount >0){
//                         refetch()
//                         Swal.fire(
//                             'Deleted!',
//                             'Your file has been deleted.',
//                             'success'
//                           )
                          
//                     }
//                 })
             
//             }
//           })
//     }
// }


// admin && <td className='border border-slate-300'>
//                                         <button className='btn btn-link' onClick={()=>handleDelete(issue._id)}>
//                                         <TrashIcon className='w-6 h-6 text-red-400'/>
//                                         </button>
//                                       </td>


// className='whitespace-pre-line border border-slate-300 '


// const [axiosSecure]=useAxiosSecure()


// const { data: dgRefueling=[],isLoading } = useQuery({
//   queryKey: ["dgRefueling"],
//   queryFn: async () => {
//       const res = await axiosSecure.get("/dgAllRefueling")
//       return res.data
//   }
// })

// // console.log(services)
// if (isLoading) {
//   return <Loading />;
// }

//delete API
// app.delete("/pgRun/:id", verifyJWT, async (req, res) => {
//   const id = req.params.id;
//   //console.log(id)
//   const filter = { _id: ObjectId(id) };
//   const result = await pgRunDataCollection.deleteOne(filter);
//   res.json(result);
// });


// const [user] = useAuthState(auth)
//   const [admin] = useAdmin(user)