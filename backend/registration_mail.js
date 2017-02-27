var nodemailer = require('nodemailer');

let send = function(data){
  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport('smtps://devday.chn%40gmail.com:s@h@jeev1@smtp.gmail.com');

  // setup e-mail data with unicode symbols
  var mailOptions = {
      to: 'devday.chn@gmail.com', // list of receivers
      subject: 'New speaker registration for ' + data.event_url, // Subject line
      text: JSON.stringify(data), // plaintext body
      html: JSON.stringify(data).replace(/,/g,',<br />').replace('{','{<br/>').replace('}','<br />}') // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.log("error sending email")
        return console.log(error);
      }
  });
};

module.exports = {
  send : send
}
