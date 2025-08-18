// Simple test script to verify notification data transformation
const { notificationService } = require('../src/services/notification');

async function testNotifications() {
  try {
    console.log('🔍 Testing notification service...');
    
    // Mock the API response to simulate what the backend sends
    const mockApiResponse = {
      data: {
        data: [
          {
            id: '1',
            user_id: 'user123',
            title: 'Created vault "Test Vault"',
            message: '{"description":"New vault created","type":"vault_created","timestamp":"2025-08-16T07:48:55.000Z"}',
            createdAt: '2025-08-16T07:48:55.000Z',
            updatedAt: '2025-08-16T07:48:55.000Z'
          },
          {
            id: '2', 
            user_id: 'user123',
            title: 'Added text to "Test Vault"',
            message: '{"description":"Text entry added","type":"entry_added","timestamp":"2025-08-16T08:17:38.000Z"}',
            createdAt: '2025-08-16T08:17:38.000Z',
            updatedAt: '2025-08-16T08:17:38.000Z'
          }
        ],
        totalCount: 2,
        totalPages: 1
      }
    };

    // Mock the api.get method
    const originalApi = require('../src/lib/api');
    const mockApi = {
      get: async () => mockApiResponse
    };

    // Replace the api import temporarily
    jest.doMock('../src/lib/api', () => mockApi);

    const response = await notificationService.getNotifications({
      pageSize: 10,
      pageNumber: 1,
      user_id: 'user123'
    });

    console.log('✅ Notification service response:', JSON.stringify(response, null, 2));

    // Verify the transformation
    if (response.data && response.data.length > 0) {
      const firstNotification = response.data[0];
      console.log('\n🔍 First notification details:');
      console.log('- ID:', firstNotification.id);
      console.log('- Title:', firstNotification.title);
      console.log('- Content:', firstNotification.content);
      console.log('- Timestamp:', firstNotification.timestamp);
      
      // Check if fields are properly mapped
      if (firstNotification.content && firstNotification.timestamp) {
        console.log('✅ Field mapping is working correctly!');
      } else {
        console.log('❌ Field mapping has issues');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNotifications(); 