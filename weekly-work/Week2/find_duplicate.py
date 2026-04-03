class Solution:
    def findDuplicate(self, nums):
        slow = fast = nums[0]
        
        # Detect cycle
        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break
        
        # Find entrance of cycle
        slow = nums[0]
        while slow != fast:
            slow = nums[slow]
            fast = nums[fast]
        
        return slow

# Time Complexity: O(n)
# Space Complexity: O(1)
