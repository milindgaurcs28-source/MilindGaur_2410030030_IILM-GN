import bisect

class Solution:
    def median(self, matrix):
        n = len(matrix)
        m = len(matrix[0])
        
        low = min(row[0] for row in matrix)
        high = max(row[-1] for row in matrix)
        
        desired = (n * m + 1) // 2
        
        while low < high:
            mid = (low + high) // 2
            count = sum(bisect.bisect_right(row, mid) for row in matrix)
            
            if count < desired:
                low = mid + 1
            else:
                high = mid
        
        return low

# Time Complexity: O(32 * n log m)
# Space Complexity: O(1)
