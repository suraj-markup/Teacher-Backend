const data = require('./data.json');
const axios = require('axios');

// API endpoint for creating questions
const API_URL = 'http://localhost:5000/api/questions'; // Update with your actual API URL

// Function to send questions to API in batches
async function sendQuestionsToAPI() {
  try {
    // Set your authentication token if required
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' // Replace with your actual token
    };

    // Process data in batches of 20 questions
    const batchSize = 20;
    let totalUploaded = 0;
    let totalErrors = [];

    // Calculate how many batches we need
    const totalBatches = Math.ceil(data.length / batchSize);
    
    console.log(`Starting upload of ${data.length} questions in ${totalBatches} batches...`);

    // Process each batch
    for (let i = 0; i < data.length; i += batchSize) {
      // Get the current batch of questions
      const batch = data.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${totalBatches} (${batch.length} questions)...`);
      
      // Process each question in the batch individually
      for (const question of batch) {
        try {
          // Send the question to the API
          const response = await axios.post(API_URL, question, { headers });
          
          // Update counters
          totalUploaded++;
          
          console.log(`Question uploaded successfully: ${question.question_text.substring(0, 50)}...`);
        } catch (error) {
          console.error(`Error uploading question: ${question.question_text.substring(0, 50)}...`);
          
          // Collect error details
          const errorMessage = error.response 
            ? `Server error: ${JSON.stringify(error.response.data)}` 
            : `Network error: ${error.message}`;
          
          totalErrors.push({
            question: question.question_text.substring(0, 50) + '...',
            error: errorMessage
          });
        }
        
        // Add a small delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Add a small delay between batches
      if (i + batchSize < data.length) {
        console.log('Waiting before next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Final summary
    console.log('\n--- Upload Summary ---');
    console.log(`Total questions uploaded: ${totalUploaded}/${data.length}`);
    
    if (totalErrors.length > 0) {
      console.log(`Errors encountered: ${totalErrors.length}`);
      console.log('Error details:');
      totalErrors.forEach((err, index) => {
        console.log(`${index + 1}. Question: ${err.question}`);
        console.log(`   Error: ${err.error}`);
      });
    } else {
      console.log('No errors encountered!');
    }
    
  } catch (error) {
    console.error('Unexpected error during upload process:', error.message);
  }
}

// Execute the function
sendQuestionsToAPI();