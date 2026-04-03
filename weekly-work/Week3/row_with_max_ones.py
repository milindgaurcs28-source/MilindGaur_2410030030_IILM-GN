class Solution:
    def rowWithMax1s(self, arr):
        max_row = -1
        max_count = 0
        
        for i in range(len(arr)):
            count = sum(arr[i])
            if count > max_count:
                max_count = count
                max_row = i
        
        return max_row

# Time Complexity: O(n*m)
# Space Complexity: O(1)
