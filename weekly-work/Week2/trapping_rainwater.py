class Solution:
    def trappingWater(self, arr):
        left, right = 0, len(arr) - 1
        left_max = right_max = 0
        water = 0
        
        while left <= right:
            if arr[left] < arr[right]:
                if arr[left] >= left_max:
                    left_max = arr[left]
                else:
                    water += left_max - arr[left]
                left += 1
            else:
                if arr[right] >= right_max:
                    right_max = arr[right]
                else:
                    water += right_max - arr[right]
                right -= 1
        
        return water

# Time Complexity: O(n)
# Space Complexity: O(1)
